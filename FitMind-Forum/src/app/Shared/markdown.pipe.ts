import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    let html = value;

    // Convert headings (e.g., ### Heading)
    html = html.replace(/^### (.*$)/gim, '<strong>$1</strong><br>');
    html = html.replace(/^## (.*$)/gim, '<strong>$1</strong><br>');
    html = html.replace(/^# (.*$)/gim, '<strong>$1</strong><br>');

    // Convert bold text (e.g., **text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert italic text (e.g., *text*)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert horizontal rules (e.g., ---)
    html = html.replace(/^---$/gim, '<hr class="my-2" style="opacity: 0.2;">');

    // Convert list items (e.g., * item or - item)
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-3">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-3">$1</li>');

    // Wrap multiple <li> into <ul>
    html = html.replace(/(<li.*?>.*?<\/li>(\s*<li.*?>.*?<\/li>)*)/gim, '<ul class="mb-2 pl-3" style="padding-left: 20px;">$1</ul>');

    // Convert newlines to breaks, ignoring those right after HTML block tags to avoid double spacing
    html = html.replace(/\n(?!<ul|<li|<\/ul|<\/li|<hr|<strong)/g, '<br>');

    return html;
  }
}
