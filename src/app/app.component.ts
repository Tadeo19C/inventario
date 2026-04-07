import { Component } from '@angular/core';
import { RegistrarProductoComponent } from './components/registrar-producto.component';
import { ListaInventarioComponent } from './components/lista-inventario.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RegistrarProductoComponent, ListaInventarioComponent],
  template: `
    <main class="min-h-screen bg-slate-950 text-slate-100">
      <header class="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
        <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 class="text-2xl md:text-3xl font-semibold tracking-tight text-slate-100">Inventario</h1>
            <p class="text-sm text-slate-400">Captura rápida y catálogo técnico</p>
          </div>
        </div>
      </header>

      <section class="py-10">
        <app-registrar-producto></app-registrar-producto>
      </section>

      <section class="pb-14">
        <app-lista-inventario></app-lista-inventario>
      </section>
    </main>
  `,
})
export class AppComponent {}
