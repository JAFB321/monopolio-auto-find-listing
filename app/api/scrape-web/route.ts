import { NextResponse } from "next/server";
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

    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SCRAPINGBEE_API_KEY is not set" },
        { status: 500 }
      );
    }

    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(
      url
    )}`;

    const response = await fetch(scrapingBeeUrl);
    if (!response.ok) {
      // Manejar error de la API de ScrapingBee
      const errorData = await response.text();
      console.error("ScrapingBee API error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to fetch content via ScrapingBee",
          details: errorData,
        },
        { status: response.status }
      );
    }
    const content = await response.text(); // El HTML de la página

    // Load content into Cheerio
    const $ = cheerio.load(content);

    // Remove non-essential elements
    $("script").remove();
    $("style").remove();
    $("noscript").remove();
    // $("iframe").remove(); // Keep iframes to check for maps
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
      coordinates: {} as { lat?: string; lon?: string }, // Added for map coordinates
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

    // Extract Google Maps coordinates
    let mapUrl: string | undefined = undefined;

    // Check actual iframes
    $("iframe").each((_, elem) => {
      const src = $(elem).attr("src");
      if (src && src.includes("https://www.google.com/maps")) {
        mapUrl = src;
        return false; // Exit loop once a map URL is found
      }
    });

    // If not found in iframes, check divs with data-lazy-iframe-url
    if (!mapUrl) {
      $("div[data-lazy-iframe-url]").each((_, elem) => {
        const lazySrc = $(elem).attr("data-lazy-iframe-url");
        if (lazySrc && lazySrc.includes("https://www.google.com/maps")) {
          mapUrl = lazySrc;
          return false; // Exit loop once a map URL is found
        }
      });
    }

    if (mapUrl) {
      try {
        // Using WHATWG URL parser, available globally in Node.js and modern browsers
        const urlObj = new URL(mapUrl);
        const qParam = urlObj.searchParams.get("q");
        if (qParam) {
          const parts = qParam.split(",");
          if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lon = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lon)) {
              contentData.coordinates = {
                lat: lat.toString(),
                lon: lon.toString(),
              };
            }
          }
        }
      } catch (e) {
        // Log error if URL parsing fails, but don't crash the scraper
        console.warn("Could not parse map URL for coordinates:", mapUrl, e);
      }
    }

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
        coordinatesFound: !!(
          contentData.coordinates.lat && contentData.coordinates.lon
        ),
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
