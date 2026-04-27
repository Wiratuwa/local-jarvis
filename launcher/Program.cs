using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Threading;
using System.Windows.Forms;

namespace LocalJARVIS
{
    static class Program
    {
        // ── Configuration ──────────────────────────────────────────
        static readonly string ProjectDir   = @"C:\Stuff\Code\Local JARVIS";
        static readonly string Antigravity  = @"C:\Users\Aloy\AppData\Local\Programs\Antigravity\Antigravity.exe";
        static readonly string BrowserUrl   = "http://localhost:8080/index.html";
        static readonly string DockerImage  = "ghcr.io/remsky/kokoro-fastapi-gpu:v0.2.2";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            var splash = new SplashForm();
            splash.Show();
            Application.DoEvents();

            try
            {
                splash.SetStatus("Starting Ollama server...", 1);
                StartOllama();

                splash.SetStatus("Starting Kokoro TTS (Docker)...", 2);
                StartKokoroTTS();

                splash.SetStatus("Starting web server...", 3);
                StartWebServer();

                splash.SetStatus("Opening Antigravity IDE...", 4);
                StartAntigravity();

                splash.SetStatus("Opening Microsoft Edge...", 5);
                Thread.Sleep(3000);
                OpenBrowser();

                splash.SetStatus("All services launched!", 5);
                Thread.Sleep(1500);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error launching JARVIS:\n\n{ex.Message}",
                    "Local JARVIS",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
            }

            splash.Close();
        }

        // ── Service Launchers ──────────────────────────────────────

        static void StartOllama()
        {
            var psi = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = "-NoExit -Command \"$host.UI.RawUI.WindowTitle = 'JARVIS - Ollama'; $env:OLLAMA_ORIGINS='*'; ollama serve\"",
                UseShellExecute = true,
                WindowStyle = ProcessWindowStyle.Normal
            };
            Process.Start(psi);
        }

        static void StartKokoroTTS()
        {
            var psi = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = $"-NoExit -Command \"$host.UI.RawUI.WindowTitle = 'JARVIS - Kokoro TTS'; docker run --gpus all -p 8880:8880 {DockerImage}\"",
                UseShellExecute = true,
                WindowStyle = ProcessWindowStyle.Normal
            };
            Process.Start(psi);
        }

        static void StartWebServer()
        {
            var psi = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = $"-NoExit -Command \"$host.UI.RawUI.WindowTitle = 'JARVIS - Bridge Server'; Set-Location '{ProjectDir}'; python execution/bridge_server.py\"",
                UseShellExecute = true,
                WindowStyle = ProcessWindowStyle.Normal
            };
            Process.Start(psi);
        }

        static void StartAntigravity()
        {
            if (File.Exists(Antigravity))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = Antigravity,
                    Arguments = $"\"{ProjectDir}\"",
                    UseShellExecute = true
                });
            }
        }

        static void OpenBrowser()
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "msedge",
                Arguments = BrowserUrl,
                UseShellExecute = true
            });
        }
    }

    // ── Splash Screen ──────────────────────────────────────────────
    class SplashForm : Form
    {
        private Label titleLabel;
        private Label statusLabel;
        private ProgressBar progressBar;
        private Panel glowPanel;

        public SplashForm()
        {
            // Form settings
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition   = FormStartPosition.CenterScreen;
            this.Size            = new Size(480, 280);
            this.BackColor       = Color.FromArgb(12, 15, 24);
            this.ShowInTaskbar   = false;
            this.TopMost         = true;
            this.DoubleBuffered  = true;

            // Rounded corners (Windows 11)
            this.Region = CreateRoundedRegion(480, 280, 18);

            // Glow accent bar at top
            glowPanel = new Panel
            {
                Dock      = DockStyle.Top,
                Height    = 3,
                BackColor = Color.FromArgb(0, 180, 255)
            };

            // Title
            titleLabel = new Label
            {
                Text      = "LOCAL JARVIS",
                Font      = new Font("Segoe UI", 22f, FontStyle.Bold),
                ForeColor = Color.FromArgb(0, 200, 255),
                BackColor = Color.Transparent,
                AutoSize  = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock      = DockStyle.None,
                Location  = new Point(0, 40),
                Size      = new Size(480, 50)
            };

            // Subtitle
            var subtitleLabel = new Label
            {
                Text      = "Initializing services...",
                Font      = new Font("Segoe UI", 9f, FontStyle.Italic),
                ForeColor = Color.FromArgb(120, 140, 170),
                BackColor = Color.Transparent,
                AutoSize  = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Location  = new Point(0, 90),
                Size      = new Size(480, 25)
            };

            // Progress bar
            progressBar = new ProgressBar
            {
                Minimum  = 0,
                Maximum  = 5,
                Value    = 0,
                Location = new Point(50, 150),
                Size     = new Size(380, 8),
                Style    = ProgressBarStyle.Continuous
            };

            // Status text
            statusLabel = new Label
            {
                Text      = "Preparing...",
                Font      = new Font("Segoe UI", 10f),
                ForeColor = Color.FromArgb(180, 200, 220),
                BackColor = Color.Transparent,
                AutoSize  = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Location  = new Point(0, 175),
                Size      = new Size(480, 30)
            };

            // Footer
            var footerLabel = new Label
            {
                Text      = "v1.0  •  One-click AI workspace",
                Font      = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(60, 75, 95),
                BackColor = Color.Transparent,
                AutoSize  = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Location  = new Point(0, 235),
                Size      = new Size(480, 20)
            };

            this.Controls.Add(glowPanel);
            this.Controls.Add(titleLabel);
            this.Controls.Add(subtitleLabel);
            this.Controls.Add(progressBar);
            this.Controls.Add(statusLabel);
            this.Controls.Add(footerLabel);
        }

        public void SetStatus(string text, int step)
        {
            statusLabel.Text  = text;
            progressBar.Value = Math.Min(step, progressBar.Maximum);
            Application.DoEvents();
        }

        private static System.Drawing.Region CreateRoundedRegion(int w, int h, int r)
        {
            var path = new System.Drawing.Drawing2D.GraphicsPath();
            path.AddArc(0, 0, r * 2, r * 2, 180, 90);
            path.AddArc(w - r * 2, 0, r * 2, r * 2, 270, 90);
            path.AddArc(w - r * 2, h - r * 2, r * 2, r * 2, 0, 90);
            path.AddArc(0, h - r * 2, r * 2, r * 2, 90, 90);
            path.CloseFigure();
            return new System.Drawing.Region(path);
        }
    }
}
