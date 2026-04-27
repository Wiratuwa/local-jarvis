import os
import argparse
import sys

def get_desktop_path():
    if os.name == 'nt':
        return os.path.join(os.environ['USERPROFILE'], 'Desktop')
    return os.path.expanduser('~/Desktop')

def list_desktop():
    desktop = get_desktop_path()
    try:
        files = os.listdir(desktop)
        result = []
        for f in files:
            full_path = os.path.join(desktop, f)
            size = os.path.getsize(full_path) if os.path.isfile(full_path) else 0
            is_dir = "DIR" if os.path.isdir(full_path) else "FILE"
            result.append(f"[{is_dir}] {f} ({size} bytes)")
        return "\n".join(result)
    except Exception as e:
        return f"Error listing desktop: {e}"

def read_desktop_file(filename):
    desktop = get_desktop_path()
    full_path = os.path.join(desktop, filename)
    if not os.path.exists(full_path):
        return f"Error: File '{filename}' not found on Desktop."
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file '{filename}': {e}"

def write_desktop_file(filename, content):
    desktop = get_desktop_path()
    full_path = os.path.join(desktop, filename)
    try:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"Successfully wrote to '{filename}' on Desktop."
    except Exception as e:
        return f"Error writing file '{filename}': {e}"

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Desktop Operations Utility')
    parser.add_argument('--list', action='store_true', help='List files on the Desktop')
    parser.add_argument('--read', type=str, help='Read a file from the Desktop')
    parser.add_argument('--write', type=str, help='Write a file to the Desktop (requires --content)')
    parser.add_argument('--content', type=str, help='Content to write to the file')
    
    args = parser.parse_args()
    
    if args.list:
        print("--- Desktop Files ---")
        print(list_desktop())
    elif args.read:
        print(f"--- Content of '{args.read}' ---")
        print(read_desktop_file(args.read))
    elif args.write:
        if args.content is None:
            print("Error: --content is required when using --write")
            sys.exit(1)
        print(write_desktop_file(args.write, args.content))
    else:
        parser.print_help()
