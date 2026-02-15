import * as fs from 'fs';
import * as path from 'path';

export class TemplateLoader {
  private static templateCache: Map<string, string> = new Map();
  private static styleCache: Map<string, string> = new Map();

  /**
   * Load HTML template file
   */
  static loadTemplate(templateName: string): string {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(
      __dirname,
      '../templates',
      `${templateName}.template.html`,
    );

    try {
      const template = fs.readFileSync(templatePath, 'utf-8');
      this.templateCache.set(templateName, template);
      return template;
    } catch (error) {
      throw new Error(
        `Failed to load template: ${templateName}. Error: ${error.message}`,
      );
    }
  }

  /**
   * Load CSS style file
   */
  static loadStyles(styleName: string): string {
    if (this.styleCache.has(styleName)) {
      return this.styleCache.get(styleName)!;
    }

    const stylePath = path.join(
      __dirname,
      '../styles',
      `${styleName}.styles.css`,
    );

    try {
      const styles = fs.readFileSync(stylePath, 'utf-8');
      this.styleCache.set(styleName, styles);
      return styles;
    } catch (error) {
      throw new Error(
        `Failed to load styles: ${styleName}. Error: ${error.message}`,
      );
    }
  }

  /**
   * Replace placeholders in template with actual values
   */
  static replacePlaceholders(
    template: string,
    placeholders: Record<string, string>,
  ): string {
    let result = template;
    
    Object.entries(placeholders).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    });

    return result;
  }

  /**
   * Clear cache (useful for development/testing)
   */
  static clearCache(): void {
    this.templateCache.clear();
    this.styleCache.clear();
  }
}
