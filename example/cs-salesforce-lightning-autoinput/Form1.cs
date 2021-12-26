using System.Text;

namespace cs_salesforce_lightning_autoinput
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            InitializeAsync();
            dataGridView1.Columns["ColumnValue"].DefaultCellStyle.WrapMode = DataGridViewTriState.True;
        }
        async void InitializeAsync()
        {
            try
            {
                await webView21.EnsureCoreWebView2Async(null);
                webView21.CoreWebView2.SetVirtualHostNameToFolderMapping("autoinput.visualforce.com", "contents", Microsoft.Web.WebView2.Core.CoreWebView2HostResourceAccessKind.Allow);
            }
            catch (Exception e)
            {
                MessageBox.Show(this
                    , $"WebView2 error!!\r\n{e.Message}"
                    , Application.ProductName, MessageBoxButtons.OK, MessageBoxIcon.Warning);
                this.Close();
            }
        }

        private void Button_goback_Click(object sender, EventArgs e)
        {
            try
            {
                webView21.GoBack();
            }
            catch { }
        }

        private void Button_goforward_Click(object sender, EventArgs e)
        {
            try
            {
                webView21.GoForward();
            }
            catch { }
        }

        private void Button_reload_Click(object sender, EventArgs e)
        {
            try
            {
                webView21.Reload();
            }
            catch { }
        }

        private void WebView21_CoreWebView2InitializationCompleted(object sender, Microsoft.Web.WebView2.Core.CoreWebView2InitializationCompletedEventArgs e)
        {
            webView21.CoreWebView2.SourceChanged += CoreWebView2_SourceChanged;
            webView21.CoreWebView2.HistoryChanged += CoreWebView2_HistoryChanged;
        }

        private void CoreWebView2_HistoryChanged(object? sender, object e)
        {
            button_goback.Enabled = webView21.CoreWebView2.CanGoBack;
            button_goforward.Enabled = webView21.CoreWebView2.CanGoForward;
        }

        private void CoreWebView2_SourceChanged(object? sender, Microsoft.Web.WebView2.Core.CoreWebView2SourceChangedEventArgs e)
        {
            textBox_url.Text = webView21.Source.AbsoluteUri;
        }

        private void Button_go_Click(object sender, EventArgs e)
        {
            try
            {
                var rawUrl = textBox_url.Text;
                Uri uri;
                if (Uri.IsWellFormedUriString(rawUrl, UriKind.Absolute))
                {
                    uri = new Uri(rawUrl);
                }
                else if (!rawUrl.Contains(' ') && rawUrl.Contains('.'))
                {
                    // An invalid URI contains a dot and no spaces, try tacking http:// on the front.
                    uri = new Uri("http://" + rawUrl);
                }
                else
                {
                    // Otherwise treat it as a web search.
                    uri = new Uri("https://bing.com/search?q=" +
                        String.Join("+", Uri.EscapeDataString(rawUrl).Split(new string[] { "%20" }, StringSplitOptions.RemoveEmptyEntries)));
                }

                webView21.Source = uri;
            }
            catch
            {

            }
        }
        private async Task LoadScript()
        {
            string script = "";
            Dictionary<string, string> list = new();
            StreamReader sr = new StreamReader("script.js", Encoding.UTF8);
            try
            {
                script = sr.ReadToEnd();
            }
            finally
            {
                sr.Close();
            }
            _ = await webView21.CoreWebView2.ExecuteScriptAsync(script);
            _ = await webView21.CoreWebView2.ExecuteScriptAsync("let g_running = false;");
            _ = await webView21.CoreWebView2.ExecuteScriptAsync("let g_cancel = null;");
        }

        private string status = "";
        private async void Button_start_ClickAsync(object sender, EventArgs e)
        {
            if (status == "")
            {
                button_start.Text = "STOP";
                status = "running";
            }
            else if (status == "running")
            {
                button_start.Text = "STOP";
                status = "cancel";
                await webView21.CoreWebView2.ExecuteScriptAsync("if(g_running){ g_cancel.cancel(); }");
                return;
            }
            else
            {
                return;
            }
            dataGridView1.ReadOnly = true;
            await LoadScript();
            bool bCancel = false;
            foreach (DataGridViewRow row in dataGridView1.Rows.Cast<DataGridViewRow>())
            {
                if (status == "cancel")
                {
                    bCancel = true;
                    break;
                }
                if (!row.IsNewRow)
                {
                    int columnIndex = 0;
                    if (dataGridView1.CurrentCell != null)
                    {
                        columnIndex = dataGridView1.CurrentCell.ColumnIndex;
                    }
                    dataGridView1.CurrentCell = dataGridView1[columnIndex, row.Index];
                    string k = Convert.ToString(row.Cells["ColumnName"].Value) ?? "";
                    string v = (Convert.ToString(row.Cells["ColumnValue"].Value) ?? "").Replace("\r", "").Replace("\n", "\\r\\n");
                    if (k.Length > 0)
                    {
                        bCancel = true;
                        for (int i = 0; i < 200; ++i)
                        {
                            if (status == "cancel")
                            {
                                bCancel = true;
                                break;
                            }
                            string running = await webView21.CoreWebView2.ExecuteScriptAsync("console.log('wati,,,');g_running");
                            if (running == "false")
                            {
                                bCancel = false;
                                break;
                            }
                            await Task.Delay(100);
                        }
                        if (bCancel)
                        {
                            await webView21.CoreWebView2.ExecuteScriptAsync("console.log('cancel');");
                            break;
                        }
                        if (status == "cancel")
                        {
                            bCancel = true;
                            break;
                        }
                        await webView21.CoreWebView2.ExecuteScriptAsync($"run('{k}', '{v}')");
                        if (k == "url")
                        {
                            await LoadScript();
                        }
                        if (status == "cancel")
                        {
                            bCancel = true;
                            break;
                        }
                    }
                }
            }
            if (bCancel)
            {
            }
            for (int i = 0; i < 200; ++i)
            {
                string running = await webView21.CoreWebView2.ExecuteScriptAsync("console.log('wait,,,');g_running");
                if (running == "false")
                {
                    break;
                }
                await Task.Delay(100);
            }

            status = "";
            button_start.Text = "START";
            dataGridView1.ReadOnly = false;
        }
    }
}