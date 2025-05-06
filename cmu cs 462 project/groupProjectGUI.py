import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import os
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from groupProjectDemo2 import CodeAnalyzer # Assuming the previous code is in code_analyzer.py

class CodeAnalyzerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Source Code Quality Analyzer")
        self.root.geometry("800x600")
        self.analyzer = None
        
        # Create main frame
        self.main_frame = ttk.Frame(self.root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Project path selection
        ttk.Label(self.main_frame, text="Project Directory:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.path_var = tk.StringVar()
        ttk.Entry(self.main_frame, textvariable=self.path_var, width=50).grid(row=0, column=1, padx=5)
        ttk.Button(self.main_frame, text="Browse", command=self.browse_directory).grid(row=0, column=2)
        
        # Analyze button
        ttk.Button(self.main_frame, text="Analyze Project", command=self.analyze_project).grid(row=1, column=0, columnspan=3, pady=10)
        
        # Metrics display
        self.metrics_frame = ttk.LabelFrame(self.main_frame, text="Metrics", padding="5")
        self.metrics_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=10)
        
        self.metric_labels = {}
        metrics = ['LOC', 'Cyclomatic Complexity', 'Code Duplication (%)', 'Cohesion', 'Coupling']
        for i, metric in enumerate(metrics):
            ttk.Label(self.metrics_frame, text=f"{metric}:").grid(row=i, column=0, sticky=tk.W, pady=2)
            self.metric_labels[metric] = ttk.Label(self.metrics_frame, text="N/A")
            self.metric_labels[metric].grid(row=i, column=1, sticky=tk.W, padx=5)
        
        # Report display
        self.report_frame = ttk.LabelFrame(self.main_frame, text="Analysis Report", padding="5")
        self.report_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=10)
        
        self.report_text = tk.Text(self.report_frame, height=10, width=70, wrap=tk.WORD)
        self.report_text.grid(row=0, column=0, padx=5, pady=5)
        scrollbar = ttk.Scrollbar(self.report_frame, orient=tk.VERTICAL, command=self.report_text.yview)
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        self.report_text['yscrollcommand'] = scrollbar.set
        
        # Visualization
        self.fig, self.ax = plt.subplots(figsize=(6, 3))
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.main_frame)
        self.canvas.get_tk_widget().grid(row=4, column=0, columnspan=3, pady=10)
        
    def browse_directory(self):
        directory = filedialog.askdirectory()
        if directory:
            self.path_var.set(directory)
    
    def analyze_project(self):
        project_path = self.path_var.get()
        if not project_path or not os.path.exists(project_path):
            messagebox.showerror("Error", "Please select a valid project directory!")
            return
        
        self.analyzer = CodeAnalyzer(project_path)
        self.analyzer.analyze_project()
        
        # Update metrics display
        self.metric_labels['LOC'].config(text=f"{self.analyzer.metrics['loc']}")
        self.metric_labels['Cyclomatic Complexity'].config(text=f"{self.analyzer.metrics['cyclomatic_complexity'] / max(1, len(self.analyzer.files_analyzed)):.2f}")
        self.metric_labels['Code Duplication (%)'].config(text=f"{self.analyzer.metrics['code_duplication']:.2f}")
        self.metric_labels['Cohesion'].config(text=f"{self.analyzer.metrics['cohesion']:.2f}")
        self.metric_labels['Coupling'].config(text=f"{self.analyzer.metrics['coupling']:.2f}")
        
        # Update report
        self.report_text.delete(1.0, tk.END)
        self.report_text.insert(tk.END, self.analyzer.generate_report())
        
        # Update visualization
        self.ax.clear()
        labels = ['LOC', 'Cyclomatic Complexity', 'Duplication (%)', 'Cohesion', 'Coupling']
        values = [
            self.analyzer.metrics['loc'] / 1000,
            self.analyzer.metrics['cyclomatic_complexity'] / max(1, len(self.analyzer.files_analyzed)),
            self.analyzer.metrics['code_duplication'],
            self.analyzer.metrics['cohesion'] * 100,
            self.analyzer.metrics['coupling'] * 100
        ]
        self.ax.bar(labels, values, color=['blue', 'green', 'red', 'purple', 'orange'])
        self.ax.set_title('Code Quality Metrics')
        self.ax.set_ylabel('Value (Scaled)')
        self.ax.grid(True)
        self.canvas.draw()

def main():
    root = tk.Tk()
    app = CodeAnalyzerGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()