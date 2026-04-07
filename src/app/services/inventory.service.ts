import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = (window as any).__env?.SUPABASE_URL ?? 'https://fzydyqxyesendlshqfzx.supabase.co';
    const supabaseKey =
      (window as any).__env?.SUPABASE_ANON_KEY ??
      'sb_publishable_pmqFIpYKLepBy6MbuS1PtA_fSJDFXC1';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async obtenerProductos(): Promise<Producto[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as Producto[];
  }

  async registrarProducto(producto: Producto): Promise<void> {
    const { error } = await this.supabase
      .from('productos')
      .upsert(producto, { onConflict: 'codigo' });

    if (error) {
      throw error;
    }
  }

  async actualizarProducto(codigo: string, descripcion: string): Promise<void> {
    const { error } = await this.supabase
      .from('productos')
      .update({ descripcion })
      .eq('codigo', codigo);

    if (error) {
      throw error;
    }
  }

  async eliminarProducto(codigo: string): Promise<void> {
    const { error } = await this.supabase
      .from('productos')
      .delete()
      .eq('codigo', codigo);

    if (error) {
      throw error;
    }
  }
}
