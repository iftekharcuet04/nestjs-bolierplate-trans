import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { GraphQLError } from "graphql";
import * as path from "path";

@Injectable()
export class TranslationService {
  private language: string = "en";
  private translations: Record<string, Record<string, string>> = {};
  // Load translations for a specific language
  private loadTranslations(): Record<string, string> {
    if (this.translations[this.language]) {
      return this.translations[this.language];
    }

    let translationFilePath = `${this.language}/translation.json`;

    const filePath = path.resolve(`./locales/${translationFilePath}`);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      this.translations[this.language] = JSON.parse(content);
      return this.translations[this.language];
    } else {
      if (process.env.APP_ENVIRONMENT === "development") {
        throw new GraphQLError(
          `Translation file for language ${this.language} not found`,
          {
            extensions: { code: "NOT_FOUND" }
          }
        );
      }
    }
  }

  translate(key: string, language?: string): string[] | string {
    if (language) this.language = language;

    const translations: Record<string, string> = this.loadTranslations();
    let translatedMessage = key;
    if (!translations) return translatedMessage;
    if (Array.isArray(key)) {
      return key
        .map((str) => {
          if (typeof str !== "string") return str;
          str = str?.split(".")[str.split(".").length - 1] || str;
          return this.getTranslationWithPlaceholders(str, translations);
        })
        .filter((value) => value !== null && value !== undefined);
    }

    // Handle single string input
    return this.getTranslationWithPlaceholders(key, translations);
  }

  private getTranslationWithPlaceholders(
    str: string,
    translation: Record<string, string>
  ): string {
    let result = translation[str] || str;
    try {
      const parsed = JSON.parse(str);
      if (typeof parsed === "object" && parsed !== null) {
        const { key, ...rest } = parsed;
        if (!key) {
          result = str;
        } else {
          result = translation[key];
          if (result && rest) {
            Object.keys(rest).forEach((placeholder) => {
              const regex = new RegExp(`{{${placeholder}}}`, "g");
              result = result.replace(regex, rest[placeholder]);
            });
          } else {
            result = key;
          }
        }
      }
    } catch (error) {
      result = result || str;
    }
    return result;
  }
}
