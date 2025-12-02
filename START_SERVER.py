#!/usr/bin/env python3
"""
Simple HTTP server to run FORGE Calendar locally.
Double-click this file to start the server and open the app in your browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Change to the directory containing this script
os.chdir(Path(__file__).parent)

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to prevent caching during development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    print(f"""
╔════════════════════════════════════════╗
║     FORGE Calendar Server              ║
╚════════════════════════════════════════╝

Starting server on http://localhost:{PORT}
Opening browser...

Press Ctrl+C to stop the server.
    """)
    
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # Open browser
        webbrowser.open(f'http://localhost:{PORT}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nShutting down server...")
            sys.exit(0)

if __name__ == "__main__":
    main()
