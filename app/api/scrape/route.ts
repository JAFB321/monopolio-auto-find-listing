import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Launch browser and get page content
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Navigating to URL:", url);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for the main content to load
    await page.waitForSelector("body", { timeout: 5000 });

    // Get the full HTML content
    const content = await page.content();
    await browser.close();

    // Load content into Cheerio
    const $ = cheerio.load(content);

    // Remove non-essential elements
    $("script").remove();
    $("style").remove();
    $("noscript").remove();
    $("iframe").remove();
    $('[class*="cookie"]').remove();
    $('[class*="ad-"]').remove();
    $('[class*="advertisement"]').remove();

    // Function to clean text
    const cleanText = (text: string) => {
      return text
        .replace(/\s+/g, " ")
        .replace(/[\n\r\t]/g, " ")
        .trim();
    };

    // Initialize content structure
    const contentData = {
      title: "",
      description: "",
      details: [] as string[],
      features: [] as string[],
      amenities: [] as string[],
      contact: [] as string[],
      location: "",
      price: "",
      images: [] as { src: string; alt?: string }[],
    };

    // Get title (first h1 or title tag)
    contentData.title =
      cleanText($("h1").first().text()) || cleanText($("title").text());

    // Get description (look for specific sections or large text blocks)
    $("div, p, section").each((_, elem) => {
      const $elem = $(elem);
      const text = cleanText($elem.text());
      const className = ($elem.attr("class") || "").toLowerCase();
      const id = ($elem.attr("id") || "").toLowerCase();

      // Skip if text is too short
      if (text.length < 15) return;

      // Skip if text is just a list of links
      if ($elem.find("a").length > 2) return;

      // Try to categorize the content
      if (
        className.includes("description") ||
        id.includes("description") ||
        $elem.prev("h2, h3, h4").text().toLowerCase().includes("descripción")
      ) {
        contentData.description = text;
      } else if (
        className.includes("detail") ||
        id.includes("detail") ||
        text.includes("m²") ||
        text.includes("baños") ||
        text.includes("recámaras")
      ) {
        contentData.details.push(text);
      } else if (
        className.includes("feature") ||
        id.includes("feature") ||
        className.includes("caracteristica") ||
        id.includes("caracteristica")
      ) {
        contentData.features.push(text);
      } else if (className.includes("ameni") || id.includes("ameni")) {
        contentData.amenities.push(text);
      } else if (
        className.includes("contact") ||
        id.includes("contact") ||
        text.includes("tel:") ||
        text.includes("mailto:")
      ) {
        contentData.contact.push(text);
      } else if (
        className.includes("location") ||
        id.includes("location") ||
        className.includes("direccion") ||
        id.includes("direccion")
      ) {
        contentData.location = text;
      } else if (
        className.includes("price") ||
        id.includes("price") ||
        text.includes("$") ||
        text.match(/[\d,]+\.?\d*/)
      ) {
        contentData.price = text;
      }
    });

    // Get list items that might be features or amenities
    $("li").each((_, elem) => {
      const text = cleanText($(elem).text());
      if (text.length < 5) return;

      if (
        text.includes("m²") ||
        text.includes("baños") ||
        text.includes("recámaras")
      ) {
        contentData.details.push(text);
      } else {
        contentData.features.push(text);
      }
    });

    // Get images
    contentData.images = $("img[src]")
      .map((_, el) => ({
        src: $(el).attr("src") || "",
        alt: $(el).attr("alt"),
      }))
      .get()
      .filter(
        (img) =>
          img.src &&
          !img.src.includes("logo") &&
          !img.src.includes("icon") &&
          img.src.length > 10
      );

    // Remove duplicates and clean arrays
    contentData.details = [...new Set(contentData.details)];
    contentData.features = [...new Set(contentData.features)];
    contentData.amenities = [...new Set(contentData.amenities)];
    contentData.contact = [...new Set(contentData.contact)];

    // Get contact links
    const contactLinks = $('a[href^="tel:"], a[href^="mailto:"]')
      .map((_, el) => ({
        type: $(el).attr("href")?.startsWith("tel:") ? "phone" : "email",
        value: $(el)
          .attr("href")
          ?.replace(/^(tel:|mailto:)/, ""),
        text: cleanText($(el).text()),
      }))
      .get();

    return NextResponse.json({
      url,
      ...contentData,
      contactLinks,
      stats: {
        detailsCount: contentData.details.length,
        featuresCount: contentData.features.length,
        amenitiesCount: contentData.amenities.length,
        imagesCount: contentData.images.length,
      },
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        error: "Error processing your request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
