"use client"

import type React from "react"

import { useState } from "react"
import {
  Building,
  Loader2,
  MapPin,
  DollarSign,
  Maximize,
  BedDouble,
  Bath,
  Home,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"

export default function PropertyAnalyzer() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")
  const [result, setResult] = useState<null | "complete" | "partial" | "error">(null)
  const [contactInfo, setContactInfo] = useState({ whatsapp: "", email: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) return

    // Reset states
    setIsLoading(true)
    setProgress(0)
    setProgressText("Analizando enlace...")
    setResult(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 500)

    // Simulate different stages of processing
    setTimeout(() => setProgressText("Extrayendo información de la propiedad..."), 1500)
    setTimeout(() => setProgressText("Calculando insights..."), 3000)

    // Simulate API response after 4 seconds
    setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)

      // Randomly select a scenario for demonstration
      const scenarios = ["complete", "partial", "error"]
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)] as "complete" | "partial" | "error"

      setResult(randomScenario)
      setIsLoading(false)
    }, 4000)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("¡Gracias! Te notificaremos cuando tengamos la información completa.")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Analiza Propiedades desde la Web</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pega el enlace de cualquier propiedad inmobiliaria y obtén insights valiosos en segundos
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ingresa el enlace de la propiedad</CardTitle>
            <CardDescription>
              Funciona con enlaces de Instagram, Facebook, TikTok o cualquier sitio inmobiliario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
              <Input
                type="url"
                placeholder="Pega aquí el link de la propiedad (Ej: https://instagram.com/p/XXXXX)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isLoading}
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  "Analizar Link"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{progressText}</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {result === "complete" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                Análisis Completo
              </CardTitle>
              <CardDescription>
                Hemos encontrado toda la información necesaria para analizar esta propiedad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                    <img
                      src="/placeholder.svg?height=300&width=500"
                      alt="Imagen de la propiedad"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Polanco, Ciudad de México</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Building className="h-4 w-4 mr-2" />
                      <span>Departamento en Venta</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>$4,500,000 MXN</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Maximize className="h-4 w-4 mr-2" />
                      <span>120 m²</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <BedDouble className="h-4 w-4 mr-2" />
                      <span>3 Habitaciones</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Bath className="h-4 w-4 mr-2" />
                      <span>2 Baños</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Insights de Monopolio</h3>
                  <Tabs defaultValue="insights">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="insights">Insights</TabsTrigger>
                      <TabsTrigger value="comparison">Comparativa</TabsTrigger>
                      <TabsTrigger value="contact">Contacto</TabsTrigger>
                    </TabsList>
                    <TabsContent value="insights" className="space-y-4 mt-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Precio por m²</p>
                        <p className="text-2xl font-bold">$37,500 MXN</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Plusvalía de la zona</p>
                        <p className="text-2xl font-bold">Alta</p>
                        <p className="text-sm text-muted-foreground">Crecimiento anual estimado: 8.5%</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Cap Rate estimado</p>
                        <p className="text-2xl font-bold">5.2%</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="comparison" className="space-y-4 mt-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Zonas comparables</p>
                        <ul className="list-disc list-inside mt-2">
                          <li>Condesa (precio promedio: $42,000/m²)</li>
                          <li>Roma Norte (precio promedio: $39,800/m²)</li>
                          <li>Anzures (precio promedio: $35,200/m²)</li>
                        </ul>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Comparativa de precio</p>
                        <p className="text-sm mt-2">
                          Esta propiedad está <span className="font-bold text-green-600">5% por debajo</span> del precio
                          promedio de propiedades similares en la zona.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="contact" className="space-y-4 mt-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">Datos del vendedor</p>
                        <p className="mt-2">Inmobiliaria Luxury Homes</p>
                        <p className="text-sm text-muted-foreground">Tel: 55-1234-5678</p>
                        <p className="text-sm text-muted-foreground">Email: contacto@luxuryhomes.mx</p>
                      </div>
                      <Alert>
                        <AlertTitle className="flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          Propiedad verificada
                        </AlertTitle>
                        <AlertDescription>
                          Esta propiedad ya está agregada a nuestro sistema y ha sido verificada por nuestro equipo.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">Ver más propiedades similares</Button>
            </CardFooter>
          </Card>
        )}

        {result === "partial" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                Información Parcial
              </CardTitle>
              <CardDescription>Hemos extraído información parcial de la propiedad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                    <img
                      src="/placeholder.svg?height=300&width=500"
                      alt="Imagen de la propiedad"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Ciudad de México (ubicación aproximada)</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Building className="h-4 w-4 mr-2" />
                      <span>Departamento (tipo aproximado)</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>$3,800,000 MXN</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Información incompleta</AlertTitle>
                    <AlertDescription>
                      Necesitamos más detalles para darte un análisis completo. Faltan los metros cuadrados exactos y la
                      ubicación precisa.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <h3 className="font-medium mb-2">Acciones automáticas</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Estamos contactando automáticamente al vendedor para obtener la información faltante. Te
                      notificaremos los resultados completos.
                    </p>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recibe los resultados completos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Déjanos tu contacto y te notificaremos cuando tengamos toda la información:
                    </p>

                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="Ej: 5512345678"
                          value={contactInfo.whatsapp}
                          onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Ej: tu@email.com"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Notificarme
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result === "error" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                Error al procesar el enlace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Link inválido</AlertTitle>
                <AlertDescription>
                  No pudimos procesar el link. Por favor, verifica que sea una URL válida de una publicación de
                  propiedad y vuelve a intentarlo.
                </AlertDescription>
              </Alert>

              <div className="mt-6 space-y-4">
                <p className="text-muted-foreground">Posibles razones:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>El enlace no corresponde a una publicación de propiedad inmobiliaria</li>
                  <li>La publicación es privada o tiene restricciones de acceso</li>
                  <li>El formato del enlace no es compatible con nuestro sistema</li>
                  <li>La página web no permite la extracción de datos</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setResult(null)} variant="outline" className="w-full">
                Intentar con otro enlace
              </Button>
            </CardFooter>
          </Card>
        )}

        {!isLoading && !result && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">Pega un enlace para comenzar</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Analiza cualquier propiedad inmobiliaria desde redes sociales o sitios web y obtén insights valiosos
                  en segundos.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
