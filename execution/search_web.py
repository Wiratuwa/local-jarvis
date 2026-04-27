import argparse
import urllib.request
import urllib.parse
from html.parser import HTMLParser
import json

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.in_script_or_style = False

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.in_script_or_style = True

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.in_script_or_style = False

    def handle_data(self, data):
        if not self.in_script_or_style:
            stripped = data.strip()
            if stripped:
                self.text.append(stripped)

def fetch_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        response = urllib.request.urlopen(req, timeout=10)
        html_content = response.read().decode('utf-8', errors='ignore')
        
        extractor = TextExtractor()
        extractor.feed(html_content)
        
        full_text = " ".join(extractor.text)
        return full_text[:10000]
    except Exception as e:
        return f"Error fetching URL: {e}"

def search_duckduckgo(query):
    url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote(query)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html_content = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
        
        # Simple extraction using string splits since no BeautifulSoup
        # This is a bit hacky but works for DuckDuckGo's simple HTML
        results = []
        parts = html_content.split('class="result__snippet')
        for part in parts[1:]:
            # Find the text inside the anchor or div
            snippet_start = part.find('>') + 1
            snippet_end = part.find('</a>', snippet_start)
            if snippet_end == -1:
                snippet_end = part.find('</div>', snippet_start)
            snippet_html = part[snippet_start:snippet_end]
            
            # Remove inner tags like <b>
            extractor = TextExtractor()
            extractor.feed(snippet_html)
            results.append(" ".join(extractor.text))
            
            if len(results) >= 5:
                break
                
        return json.dumps(results, indent=2)
    except Exception as e:
        return f"Error searching: {e}"

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Web search and fetch utility')
    parser.add_argument('--search', type=str, help='Search query')
    parser.add_argument('--url', type=str, help='URL to fetch text from')
    
    args = parser.parse_args()
    
    if args.search:
        print(f"--- Search Results for: {args.search} ---")
        print(search_duckduckgo(args.search))
    elif args.url:
        print(f"--- Extracted Text from: {args.url} ---")
        print(fetch_url(args.url))
    else:
        parser.print_help()
