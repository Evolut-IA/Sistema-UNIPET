#!/usr/bin/env python3
import re

# Read the file
with open('src/pages/checkout.tsx', 'r') as f:
    content = f.read()

print("Applying JSX Fragment corrections...")

# Fix 1: isLoading ternary (lines around 3196-3198)
# Pattern: {isLoading ? ( <div...> <span...> ) : (
pattern1 = r'({isLoading \? \(\s*\n\s*)(<div[^>]*>.*?</div>\s*\n\s*<span[^>]*>.*?</span>)(\s*\n.*?\) : \()'
replacement1 = r'\1<>\2</>\3'
content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

# Fix 2: pixPaymentStatus === 'approved' ternary
pattern2 = r'({pixPaymentStatus === [\'"]approved[\'"] \? \(\s*\n\s*// Payment Confirmed State\s*\n)(\s*<div[^>]*>.*?</p>\s*\n)(\s*\) : pixPaymentStatus === [\'"]rejected[\'"] \?)'
replacement2 = r'\1<>\2</>\3'
content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

# Fix 3: pixPaymentStatus === 'rejected' ternary
pattern3 = r'({pixPaymentStatus === [\'"]rejected[\'"] \? \(\s*\n\s*// Payment Rejected State\s*\n)(\s*<div[^>]*>.*?</p>\s*\n)(\s*\) : \()'
replacement3 = r'\1<>\2</>\3'
content = re.sub(pattern3, replacement3, content, flags=re.DOTALL)

# Fix 4: isCopying ternary - check if needed
pattern4 = r'({isCopying \? \(\s*\n)(\s*<span[^>]*>.*?</span>\s*\n)(\s*\) : \()'
replacement4 = r'\1<>\2</>\3'
content = re.sub(pattern4, replacement4, content, flags=re.DOTALL)

# Write back to file
with open('src/pages/checkout.tsx', 'w') as f:
    f.write(content)

print("JSX Fragment corrections applied successfully!")