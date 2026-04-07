import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto } from '../models/producto';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="max-w-3xl mx-auto px-6">
      <div class="mb-6">
        <h2 class="text-2xl font-semibold">Registrar producto</h2>
        <p class="text-sm text-slate-400">Captura rápida con escáner o teclado.</p>
      </div>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="grid grid-cols-1 gap-4 bg-slate-900/70 shadow-2xl shadow-black/40 border border-slate-800 rounded-2xl p-6 md:p-8"
      >
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Código</label>
          <input
            #codigoInput
            type="text"
            formControlName="codigo"
            autocomplete="off"
            autofocus
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Escanea o digita el código"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Descripción</label>
          <textarea
            rows="3"
            formControlName="descripcion"
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Ejemplo: Patchcord de fibra óptica SC-UPC/SC-UPC mono modo 2 mts"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800"
            (click)="form.reset()"
          >
            Limpiar
          </button>
          <button
            type="submit"
            [disabled]="form.invalid || loading"
            class="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-500 disabled:opacity-50"
          >
            {{ loading ? 'Guardando...' : 'Registrar' }}
          </button>
        </div>
      </form>

      <p *ngIf="mensaje" class="mt-4 text-sm" [class.text-emerald-600]="!error" [class.text-rose-600]="error">
        {{ mensaje }}
      </p>
    </section>
  `,
})
export class RegistrarProductoComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);

  @ViewChild('codigoInput') codigoInput?: ElementRef<HTMLInputElement>;

  loading = false;
  mensaje = '';
  error = false;

  form = this.fb.group({
    codigo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
  });

  ngAfterViewInit(): void {
    this.codigoInput?.nativeElement.focus();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.mensaje = '';
    this.error = false;

    try {
      const producto = this.form.getRawValue() as Producto;
      await this.inventoryService.registrarProducto(producto);
      this.mensaje = 'Producto registrado correctamente.';
      this.form.reset({
        codigo: '',
        descripcion: '',
      });
      this.codigoInput?.nativeElement.focus();
    } catch (err) {
      this.mensaje = 'No se pudo registrar el producto.';
      this.error = true;
    } finally {
      this.loading = false;
    }
  }
}
