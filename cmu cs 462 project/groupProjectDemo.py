# Source Code Quality Analyzer
# This tool analyzes Python source code and computes metrics such as LOC, Cyclomatic Complexity, Code Duplication, Cohesion, and Coupling.
# It generates a report with improvement suggestions and compares results with industry standards.

import ast
import os
from collections import defaultdict
import difflib
import matplotlib.pyplot as plt
from typing import Dict, List, Tuple
import numpy as np

class CodeAnalyzer:
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.metrics = {
            'loc': 0,
            'cyclomatic_complexity': 0,
            'code_duplication': 0.0,
            'cohesion': 0.0,
            'coupling': 0.0
        }
        self.files_analyzed = []
        self.duplicate_lines = []
        self.class_methods = defaultdict(list)

    def count_loc(self, file_path: str) -> int:
        """Count Lines of Code (excluding comments and blank lines)."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                loc = sum(1 for line in lines if line.strip() and not line.strip().startswith('#'))
                return loc
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return 0

    def calculate_cyclomatic_complexity(self, file_path: str) -> int:
        """Calculate Cyclomatic Complexity using AST."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                tree = ast.parse(file.read())
            
            complexity = 1
            for node in ast.walk(tree):
                if isinstance(node, (ast.If, ast.For, ast.While, ast.Try, ast.With)):
                    complexity += 1
                elif isinstance(node, ast.BoolOp):
                    complexity += len(node.values) - 1
            return complexity
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
            return 0

    def detect_code_duplication(self, file_path: str) -> float:
        """Detect code duplication using a simple line-based comparison."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                lines = [line.strip() for line in file.readlines() if line.strip() and not line.strip().startswith('#')]
            
            duplicates = 0
            seen = set()
            for i, line in enumerate(lines):
                if line in seen:
                    duplicates += 1
                    self.duplicate_lines.append((file_path, i + 1, line))
                else:
                    seen.add(line)
            
            if len(lines) == 0:
                return 0.0
            return (duplicates / len(lines)) * 100
        except Exception as e:
            print(f"Error analyzing duplication in {file_path}: {e}")
            return 0.0

    def calculate_cohesion(self, file_path: str) -> float:
        """Calculate class cohesion (LCOM4 metric approximation)."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                tree = ast.parse(file.read())
            
            class_name = None
            methods = []
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    class_name = node.name
                elif isinstance(node, ast.FunctionDef) and class_name:
                    methods.append(node.name)
            
            if not methods:
                return 0.0
            
            # Simplified LCOM4: Assume high cohesion if methods are present
            self.class_methods[class_name] = methods
            return len(methods) / (len(methods) + 1)
        except Exception as e:
            print(f"Error calculating cohesion in {file_path}: {e}")
            return 0.0

    def calculate_coupling(self, file_path: str) -> float:
        """Calculate coupling by counting imports and external references."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                tree = ast.parse(file.read())
            
            imports = set()
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    imports.update(alias.name for alias in node.names)
                elif isinstance(node, ast.ImportFrom):
                    imports.update(alias.name for alias in node.names)
            
            return len(imports) / 10.0  # Normalize to 0-1 scale
        except Exception as e:
            print(f"Error calculating coupling in {file_path}: {e}")
            return 0.0

    def analyze_project(self):
        """Analyze all Python files in the project directory."""
        for root, _, files in os.walk(self.project_path):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    self.files_analyzed.append(file_path)
                    
                    # Calculate metrics
                    self.metrics['loc'] += self.count_loc(file_path)
                    self.metrics['cyclomatic_complexity'] += self.calculate_cyclomatic_complexity(file_path)
                    self.metrics['code_duplication'] += self.detect_code_duplication(file_path)
                    self.metrics['cohesion'] += self.calculate_cohesion(file_path)
                    self.metrics['coupling'] += self.calculate_coupling(file_path)
        
        # Normalize metrics
        if self.files_analyzed:
            self.metrics['code_duplication'] /= len(self.files_analyzed)
            self.metrics['cohesion'] /= len(self.files_analyzed)
            self.metrics['coupling'] /= len(self.files_analyzed)

    def generate_report(self) -> str:
        """Generate a detailed report with improvement suggestions."""
        report = ["Code Quality Analysis Report\n", "=" * 30 + "\n"]
        
        report.append(f"Total Lines of Code (LOC): {self.metrics['loc']}")
        report.append(f"Average Cyclomatic Complexity: {self.metrics['cyclomatic_complexity'] / max(1, len(self.files_analyzed)):.2f}")
        report.append(f"Code Duplication: {self.metrics['code_duplication']:.2f}%")
        report.append(f"Average Cohesion: {self.metrics['cohesion']:.2f}")
        report.append(f"Average Coupling: {self.metrics['coupling']:.2f}\n")
        
        report.append("Improvement Suggestions:\n")
        if self.metrics['cyclomatic_complexity'] / max(1, len(self.files_analyzed)) > 10:
            report.append("- High cyclomatic complexity detected. Consider refactoring complex functions.")
        if self.metrics['code_duplication'] > 10:
            report.append("- Significant code duplication found. Consider extracting common code into functions.")
            for file_path, line_num, line in self.duplicate_lines[:5]:  # Limit to 5 examples
                report.append(f"  * Duplicated line in {file_path}:{line_num}: {line}")
        if self.metrics['cohesion'] < 0.5:
            report.append("- Low cohesion in classes. Ensure methods in a class work on shared data.")
        if self.metrics['coupling'] > 0.5:
            report.append("- High coupling detected. Reduce dependencies between modules.")
        
        report.append("\nComparison with SonarQube Standards:")
        report.append("- LOC: Comparable to SonarQube's total lines metric.")
        report.append("- Cyclomatic Complexity: SonarQube flags >10 as high; our average is {:.2f}".format(
            self.metrics['cyclomatic_complexity'] / max(1, len(self.files_analyzed))))
        report.append("- Code Duplication: SonarQube flags >5%; ours is {:.2f}%".format(self.metrics['code_duplication']))
        
        return "\n".join(report)

    def visualize_metrics(self):
        """Generate a bar chart of metrics."""
        labels = ['LOC', 'Cyclomatic Complexity', 'Duplication (%)', 'Cohesion', 'Coupling']
        values = [
            self.metrics['loc'] / 1000,  # Scale for visualization
            self.metrics['cyclomatic_complexity'] / max(1, len(self.files_analyzed)),
            self.metrics['code_duplication'],
            self.metrics['cohesion'] * 100,
            self.metrics['coupling'] * 100
        ]
        
        plt.figure(figsize=(10, 6))
        plt.bar(labels, values, color=['blue', 'green', 'red', 'purple', 'orange'])
        plt.title('Code Quality Metrics')
        plt.ylabel('Value (Scaled)')
        plt.grid(True)
        plt.savefig('metrics_visualization.png')
        plt.close()

def main():
    project_path = input("Enter the project directory path: ")
    if not os.path.exists(project_path):
        print("Invalid directory path!")
        return
    
    analyzer = CodeAnalyzer(project_path)
    print("Analyzing project...")
    analyzer.analyze_project()
    
    report = analyzer.generate_report()
    print(report)
    
    analyzer.visualize_metrics()
    print("Metrics visualization saved as 'metrics_visualization.png'")

if __name__ == "__main__":
    main()