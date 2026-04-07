import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="max-w-5xl mx-auto px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 class="text-2xl font-semibold">Inventario</h2>
          <p class="text-sm text-slate-400">Lista de productos registrados.</p>
        </div>
        <button
          type="button"
          class="px-4 py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800"
          (click)="cargarProductos()"
        >
          Actualizar
        </button>
      </div>

      <div class="overflow-x-auto bg-slate-900/70 shadow-2xl shadow-black/40 border border-slate-800 rounded-2xl">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-800/60 text-slate-300">
            <tr>
              <th class="text-left px-4 py-3">Código</th>
              <th class="text-left px-4 py-3">Descripción</th>
              <th class="text-left px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let producto of productosOrdenados()"
              class="border-t border-slate-800 hover:bg-slate-800/60"
            >
              <td class="px-4 py-3 font-medium text-slate-100">{{ producto.codigo }}</td>
              <td class="px-4 py-3">
                <ng-container *ngIf="edicionCodigo() !== producto.codigo; else editarDescripcion">
                  {{ producto.descripcion }}
                </ng-container>
                <ng-template #editarDescripcion>
                  <input
                    type="text"
                    [formControl]="form.controls.descripcion"
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </ng-template>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    *ngIf="edicionCodigo() !== producto.codigo"
                    type="button"
                    class="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800"
                    (click)="iniciarEdicion(producto)"
                  >
                    Editar
                  </button>
                  <button
                    *ngIf="edicionCodigo() === producto.codigo"
                    type="button"
                    class="px-3 py-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-500"
                    (click)="guardarEdicion()"
                  >
                    Guardar
                  </button>
                  <button
                    *ngIf="edicionCodigo() === producto.codigo"
                    type="button"
                    class="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800"
                    (click)="cancelarEdicion()"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 rounded-xl border border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                    (click)="eliminar(producto.codigo)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="error" class="mt-3 text-sm text-rose-300">No se pudieron cargar los productos.</p>
    </section>
  `,
})
export class ListaInventarioComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  productos = signal<Producto[]>([]);
  edicionCodigo = signal<string | null>(null);
  error = false;

  form = this.fb.group({
    descripcion: ['', [Validators.required]],
  });

  productosOrdenados = computed(() => this.productos());

  ngOnInit(): void {
    this.cargarProductos();

    this.inventoryService
      .onRefresh()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.cargarProductos();
      });
  }

  async cargarProductos(): Promise<void> {
    this.error = false;

    try {
      const data = await this.inventoryService.obtenerProductos();
      this.productos.set(data);
    } catch (err) {
      this.error = true;
    }
  }

  iniciarEdicion(producto: Producto): void {
    this.edicionCodigo.set(producto.codigo);
    this.form.patchValue({ descripcion: producto.descripcion });
  }

  cancelarEdicion(): void {
    this.edicionCodigo.set(null);
    this.form.reset();
  }

  async guardarEdicion(): Promise<void> {
    const codigo = this.edicionCodigo();
    const descripcion = this.form.value.descripcion?.trim();

    if (!codigo || !descripcion) {
      return;
    }

    try {
      await this.inventoryService.actualizarProducto(codigo, descripcion);
      await this.cargarProductos();
      this.cancelarEdicion();
    } catch (err) {
      this.error = true;
    }
  }

  async eliminar(codigo: string): Promise<void> {
    if (!confirm('¿Eliminar este producto?')) {
      return;
    }

    try {
      await this.inventoryService.eliminarProducto(codigo);
      await this.cargarProductos();
    } catch (err) {
      this.error = true;
    }
  }
}
