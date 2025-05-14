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
      `${process.env.NEXT_PUBLIC_API_URL}/api/scrape?url=${url}`
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
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: 'Analiza este contenido de una publicación de una propiedad en venta o renta\n\nes el contenido de la pagina web\n\ndamelo en json con los siguientes campos\n\n{\n  "listingTitle": "", // Titulo del listing\n  "price": "", // Precio en MXN (parseado a numero),\n  "priceUsd": "", // Precio en USD (parseado a numero),\n  "location": "", // Ubicación o Dirección \n  "areaInSquareMeters": 0, // Superficie en m2\n  "numberOfBedrooms": 0, // Numero de cuartos\n  "numberOfBathrooms": 0,  // Numero de baños\n  "parkingSpaces": 0, // Estacionamientos\n  "propertyDescription": "", // Breve descripción de la propiedad (50 palabras)\n  "developmentAmenities": [], // Array de strings con las amenidades (nombres cortos, de 1-3 palabras)\n  "advertiserName": "", // Nombre del vendedor (persona y/o empresa)\n  "contactPhone": "", // Numero de telefono de contacto\n "contactEmail": "",\n "mainPhotos": [],// Array de strings con las urls de las 3 imagenes principales de la propiedad\n}',
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: scrapeData,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_object",
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
      result: JSON.parse(response.output_text),
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
