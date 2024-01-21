/**
 * Generate a text which trigger a download popup
 * @param filename downloaded file name
 * @param content downloaded file content
 */
export function showFileDownloadPopup(filename: string, content: string) {
  const id = `id${Math.random()}`
  const download = `
<script>
var element = document.getElementById('${id}');
if (!element) {
element = document.createElement('a');
element.setAttribute('id', '${id}');
element.setAttribute('href', 'data:text/plain;charset=utf-8,${encodeURIComponent(content)}');
element.setAttribute('download', '${filename.replace("'", "\\'")}');

element.style.display = 'none';
document.body.appendChild(element);

element.click();
}
</script>
  `
  console.log(
    download
      .split("\n")
      .map((s) => s.trim())
      .join("")
  )
}
