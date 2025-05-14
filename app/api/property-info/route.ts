import OpenAI from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    // call scrape route
    const scrapeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/scrape-web?url=${url}`
    );
    const scrapeData = await scrapeResponse.json();

    console.log(JSON.stringify(scrapeData));

    if (!scrapeData) {
      return NextResponse.json(
        { error: "No data from scrapping" },
        { status: 400 }
      );
    }
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: 'Analiza este contenido de una publicación de una propiedad en venta o renta\n\nes el contenido de la pagina web\n\ndamelo en json con los siguientes campos\n\n{\n  "listingTitle": "", // Titulo del listing\n  "price": "", // Precio en MXN (parseado a numero),\n  "priceUsd": "", // Precio en USD (parseado a numero),\n  "location": "", // Ubicación o Dirección \n  "areaInSquareMeters": 0, // Superficie en m2\n  "numberOfBedrooms": 0, // Numero de cuartos\n  "numberOfBathrooms": 0,  // Numero de baños\n  "numberOfHalfBathrooms": 0, // Numero de medios baños\n  "parkingSpaces": 0, // Estacionamientos\n  "propertyDescription": "", // Breve descripción de la propiedad (50 palabras)\n  "developmentAmenities": {}// Objeto con el sig formato: interface DevelopmentAmenities { hasElevator: boolean; hasGarden: boolean; hasGym: boolean; hasJacuzzi: boolean; hasPool: boolean; hasSurveillance: boolean; hasStudio: boolean; hasBusinessCenter: boolean; hasEventsHall: boolean; hasKidsPlayground: boolean; hasMultipurposeHall: boolean; hasSpecialFacilities: boolean; hasCafeteria: boolean; hasGrill: boolean; isCondominium: boolean; hasGolfClub?: boolean; hasSharedRooftop: boolean; hasWaterFront?: boolean; }\n  "advertiserName": "", // Nombre del vendedor (persona y/o empresa)\n  "contactPhone": "", // Numero de telefono de contacto\n "contactEmail": "",\n "mainPhotos": [],// Array de strings con las urls de las 3 imagenes principales de la propiedad\n}',
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(scrapeData),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "extract_property_listing",
          strict: true,
          schema: {
            type: "object",
            properties: {
              listingTitle: {
                type: "string",
              },
              price: {
                type: "number",
              },
              priceUsd: {
                type: "number",
              },
              location: {
                type: "string",
              },
              areaInSquareMeters: {
                type: "number",
              },
              numberOfBedrooms: {
                type: "integer",
              },
              numberOfBathrooms: {
                type: "integer",
              },
              numberOfHalfBathrooms: {
                type: "integer",
              },
              parkingSpaces: {
                type: "integer",
              },
              propertyDescription: {
                type: "string",
              },
              developmentAmenities: {
                type: "object",
                properties: {
                  hasElevator: {
                    type: "boolean",
                  },
                  hasGarden: {
                    type: "boolean",
                  },
                  hasGym: {
                    type: "boolean",
                  },
                  hasJacuzzi: {
                    type: "boolean",
                  },
                  hasPool: {
                    type: "boolean",
                  },
                  hasSurveillance: {
                    type: "boolean",
                  },
                  hasStudio: {
                    type: "boolean",
                  },
                  hasBusinessCenter: {
                    type: "boolean",
                  },
                  hasEventsHall: {
                    type: "boolean",
                  },
                  hasKidsPlayground: {
                    type: "boolean",
                  },
                  hasMultipurposeHall: {
                    type: "boolean",
                  },
                  hasSpecialFacilities: {
                    type: "boolean",
                  },
                  hasCafeteria: {
                    type: "boolean",
                  },
                  hasGrill: {
                    type: "boolean",
                  },
                  isCondominium: {
                    type: "boolean",
                  },
                  hasGolfClub: {
                    type: "boolean",
                  },
                  hasSharedRooftop: {
                    type: "boolean",
                  },
                  hasWaterFront: {
                    type: "boolean",
                  },
                },
                required: [
                  "hasElevator",
                  "hasGarden",
                  "hasGym",
                  "hasJacuzzi",
                  "hasPool",
                  "hasSurveillance",
                  "hasStudio",
                  "hasBusinessCenter",
                  "hasEventsHall",
                  "hasKidsPlayground",
                  "hasMultipurposeHall",
                  "hasSpecialFacilities",
                  "hasCafeteria",
                  "hasGrill",
                  "isCondominium",
                  "hasGolfClub",
                  "hasSharedRooftop",
                  "hasWaterFront",
                ],
                additionalProperties: false,
              },
              advertiserName: {
                type: "string",
              },
              contactPhone: {
                type: "string",
              },
              contactEmail: {
                type: "string",
              },
              mainPhotos: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: [
              "listingTitle",
              "price",
              "priceUsd",
              "location",
              "areaInSquareMeters",
              "numberOfBedrooms",
              "numberOfBathrooms",
              "numberOfHalfBathrooms",
              "parkingSpaces",
              "propertyDescription",
              "developmentAmenities",
              "advertiserName",
              "contactPhone",
              "contactEmail",
              "mainPhotos",
            ],
            additionalProperties: false,
          },
        },
      },
      reasoning: {},
      tools: [],
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: true,
    });

    if (!response.output_text) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: {
        ...JSON.parse(response.output_text),
        latitude: scrapeData.coordinates.lat,
        longitude: scrapeData.coordinates.lon,
      },
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
