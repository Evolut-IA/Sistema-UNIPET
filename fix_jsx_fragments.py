#!/usr/bin/env python3
"""
Script to fix JSX fragment issues in checkout.tsx
"""

import re

def fix_jsx_fragments():
    # Read the file
    with open('client/src/pages/checkout.tsx', 'r') as f:
        lines = f.readlines()
    
    # Define the fixes needed based on the task requirements
    fixes = [
        {
            'line': 3245,  # After "Payment Confirmed State" comment
            'action': 'replace',
            'old': '                    // Payment Confirmed State\n',
            'new': '                    <>\n'
        },
        {
            'line': 3267,  # Before closing the first condition
            'action': 'replace', 
            'old': '              \n',
            'new': '                    </>\n'
        },
        {
            'line': 3270,  # After "Payment Rejected State" comment
            'action': 'replace',
            'old': '                    // Payment Rejected State\n',
            'new': '                    <>\n'
        },
        {
            'line': 3286,  # Before closing the second condition
            'action': 'replace',
            'old': '              \n',
            'new': '                    </>\n'
        },
        {
            'line': 3289,  # After ") : (" for the third condition
            'action': 'insert_after',
            'new': '                    <>\n'
        }
    ]
    
    # Apply fixes
    modified_lines = lines[:]
    offset = 0
    
    for fix in fixes:
        line_idx = fix['line'] - 1 + offset  # Convert to 0-based index
        
        if fix['action'] == 'replace':
            if line_idx < len(modified_lines):
                print(f"Replacing line {fix['line']}: {repr(modified_lines[line_idx].rstrip())}")
                modified_lines[line_idx] = fix['new']
        elif fix['action'] == 'insert_after':
            if line_idx < len(modified_lines):
                print(f"Inserting after line {fix['line']}: {repr(fix['new'].rstrip())}")
                modified_lines.insert(line_idx + 1, fix['new'])
                offset += 1
    
    # Show what we're working with around the problematic areas
    print("\n=== SHOWING LINES AROUND KEY AREAS ===")
    for line_num in [3244, 3245, 3246, 3267, 3268, 3269, 3270, 3271, 3286, 3287, 3288, 3289, 3290]:
        if line_num - 1 < len(lines):
            print(f"Line {line_num}: {repr(lines[line_num - 1].rstrip())}")
    
    return modified_lines

if __name__ == '__main__':
    modified_lines = fix_jsx_fragments()
    print(f"\nScript completed. Found {len(modified_lines)} total lines.")