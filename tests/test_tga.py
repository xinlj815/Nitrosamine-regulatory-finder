"""TGA refresh regressions; no network or notifications are performed."""
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import requests

SPEC = importlib.util.spec_from_file_location("updater", Path(__file__).resolve().parents[1] / "scripts/update_data.py")
updater = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(updater)


def response(text):
    result = requests.Response()
    result.status_code = 200
    result._content = text.encode("utf-8")
    result.encoding = "utf-8"
    return result


def csv(rows=55, dates=True):
    header = "Nitrosamine,AI limit (ng/day),Source"
    if dates:
        header += ",Date updated"
    lines = [header]
    for index in range(rows):
        lines.append(f"N-nitroso-test-{index},96,Test drug" + (",2026-09-01" if dates else ""))
    return "\n".join(lines)


class TgaTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {name: "" for name in (
            "TGA_CSV_PATH", "TGA_HTML_PATH", "TGA_CSV_URL")})
        self.env.start()
        self.addCleanup(self.env.stop)
        self.registry = updater.Registry({})

    def test_discovers_renamed_official_csv_instead_of_guessing_month(self):
        url = "https://www.tga.gov.au/sites/default/files/2026-09/nitrosamine-ai-v2.csv"
        html = '<a href="/sites/default/files/2026-09/nitrosamine-ai-v2.csv">Download CSV</a>'
        with patch.object(updater, "get_with_retry", side_effect=[response(html), response(csv())]) as get:
            status = updater.parse_tga(self.registry)
        self.assertEqual([call.args[0] for call in get.call_args_list], [updater.TGA_URL, url])
        self.assertEqual(status["download_url"], url)
        self.assertEqual(status["updated"], "2026-09-01")
        self.assertEqual(len(self.registry.records), 55)

    def test_timeout_on_first_month_does_not_abort_search(self):
        with patch.object(updater, "tga_csv_candidates", return_value=["https://www.tga.gov.au/new.csv", "https://www.tga.gov.au/old.csv"]), patch.object(
            updater, "get_with_retry", side_effect=[requests.ReadTimeout("page stalled"), requests.ReadTimeout("new month stalled"), response(csv())]
        ) as get:
            status = updater.parse_tga(self.registry)
        self.assertEqual(get.call_count, 3)
        self.assertEqual(status["mode"], "official CSV")

    def test_malformed_download_does_not_hide_next_valid_csv(self):
        html = '<a href="/nitrosamine-bad.csv">CSV</a><a href="/nitrosamine-good.csv">CSV</a>'
        with patch.object(updater, "get_with_retry", side_effect=[response(html), response("<html>blocked</html>"), response(csv())]):
            status = updater.parse_tga(self.registry)
        self.assertTrue(status["download_url"].endswith("good.csv"))

    def test_html_fallback_reuses_page_when_csv_times_out(self):
        table = updater.pd.read_csv(updater.StringIO(csv())).to_html(index=False)
        html = '<a href="/nitrosamine.csv">CSV</a><p>Last updated 2 September 2026</p>' + table
        with patch.object(updater, "get_with_retry", side_effect=[response(html), requests.ReadTimeout("CSV stalled")]) as get:
            status = updater.parse_tga(self.registry)
        self.assertEqual(get.call_count, 2)
        self.assertEqual(status["mode"], "HTML fallback")
        self.assertEqual(status["updated"], "2026-09-02")

    def test_offline_html_never_requests_network(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "tga.html"
            path.write_text(updater.pd.read_csv(updater.StringIO(csv())).to_html(index=False))
            with patch.dict(os.environ, {"TGA_HTML_PATH": str(path)}), patch.object(updater, "get_with_retry") as get:
                updater.parse_tga(self.registry)
            get.assert_not_called()

    def test_unknown_date_is_not_fabricated_as_today(self):
        with patch.dict(os.environ, {"TGA_CSV_URL": "https://www.tga.gov.au/nitrosamine.csv"}), patch.object(updater, "get_with_retry", return_value=response(csv(dates=False))):
            self.assertEqual(updater.parse_tga(self.registry)["updated"], "")

    def test_incomplete_table_does_not_mutate_registry(self):
        html = updater.pd.read_csv(updater.StringIO(csv(rows=1))).to_html(index=False)
        with patch.object(updater, "get_with_retry", return_value=response(html)):
            with self.assertRaisesRegex(ValueError, "incomplete refresh"):
                updater.parse_tga(self.registry)
        self.assertEqual(self.registry.records, {})

    def test_csv_links_reject_non_official_downloads(self):
        html = '<a href="https://example.com/nitrosamine.csv">CSV</a><a href="http://www.tga.gov.au/nitrosamine.csv">CSV</a><a href="/nitrosamine.csv?download=1">CSV</a>'
        self.assertEqual(updater.tga_csv_links(html), ["https://www.tga.gov.au/nitrosamine.csv?download=1"])

    def test_fallback_search_stops_at_budget(self):
        with patch.object(updater, "get_with_retry", side_effect=requests.ReadTimeout("page stalled")) as get, patch.object(updater.time, "monotonic", side_effect=[0, 91]):
            with self.assertRaisesRegex(RuntimeError, "time budget exhausted"):
                updater.parse_tga(self.registry)
        self.assertEqual(get.call_count, 1)


if __name__ == "__main__":
    unittest.main()
