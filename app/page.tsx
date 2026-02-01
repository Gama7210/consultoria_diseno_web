import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Palette, Code, Smartphone, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-foreground">
            R&G Consultoria Digital
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-foreground font-medium">
              Inicio
            </Link>
            <Link href="/contacto" className="text-muted-foreground hover:text-foreground transition-colors">
              Contacto
            </Link>
            <Link href="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Panel Admin
            </Link>
          </nav>
        </div>
      </header>

      
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Transformamos Ideas en Experiencias Digitales
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Somos expertos en diseno web, desarrollo de aplicaciones y estrategias digitales
            que impulsan el crecimiento de tu negocio.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contacto">
                Contactanos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              Ver Servicios
            </Button>
          </div>
        </div>
      </section>

      
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Nuestros Servicios
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Diseno Web</CardTitle>
                <CardDescription>
                  Sitios web modernos y responsivos que capturan la esencia de tu marca
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Desarrollo</CardTitle>
                <CardDescription>
                  Aplicaciones web y moviles con tecnologias de vanguardia
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Identidad visual que hace que tu marca destaque del resto
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Apps Moviles</CardTitle>
                <CardDescription>
                  Aplicaciones nativas e hibridas para iOS y Android
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Listo para comenzar tu proyecto?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Contactanos hoy y recibe una consulta gratuita para discutir como podemos
            ayudarte a alcanzar tus objetivos digitales.
          </p>
          <Button asChild size="lg">
            <Link href="/contacto">
              Solicitar Consulta Gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>2026 R&G Consultoria Digital. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
