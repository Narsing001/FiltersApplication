import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private API_URL = 'https://fakestoreapi.com/products';

  private searchSubject = new BehaviorSubject<string>('');
  private categorySubject = new BehaviorSubject<string>('');
  private priceRangeSubject = new BehaviorSubject<number[]>([0, 1000]); // Default: 0 - 1000

  private pageSize = 10;
  private productsSubject = new BehaviorSubject<any[]>([]); 
  private loadedPages = 0; 

  constructor(private http: HttpClient) {
    this.loadMore();
  }

  private fetchProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  loadMore() {
    this.fetchProducts().pipe(
      map(products => products.slice(0, (this.loadedPages + 1) * this.pageSize))
    ).subscribe(updatedProducts => {
      this.productsSubject.next(updatedProducts);
      this.loadedPages++;
    });
  }

  getFilteredProducts(): Observable<any[]> {
    return combineLatest([
      this.productsSubject.asObservable(),
      this.searchSubject.asObservable(),
      this.categorySubject.asObservable(),
      this.priceRangeSubject.asObservable()
    ]).pipe(
      map(([products, search, category, priceRange]) => {
        const [minPrice, maxPrice] = priceRange;
        
        return products.filter(product => 
          (!search || product.title.toLowerCase().includes(search.toLowerCase())) &&
          (!category || product.category === category) &&
          (product.price >= minPrice && product.price <= maxPrice) 
        );
      })
    );
  }

  updateSearchTerm(term: any) { this.searchSubject.next(term); }
  updateCategory(category: any) { this.categorySubject.next(category); }
  updatePriceRange(range: any[]) { 
    this.priceRangeSubject.next(range); 
  }


  
}
