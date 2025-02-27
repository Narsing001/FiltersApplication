import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProductService } from 'src/app/Service/product.service';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.scss']
})
export class ProductListingComponent {
  
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport | undefined;

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  priceMinControl = new FormControl(0);  
  priceMaxControl = new FormControl(1000); 

  products$!: Observable<any[]>;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products$ = this.productService.getFilteredProducts();

    this.searchControl.valueChanges.subscribe(value => this.productService.updateSearchTerm(value));
    this.categoryControl.valueChanges.subscribe(value => this.productService.updateCategory(value));

    this.priceMinControl.valueChanges.subscribe(min => {
      const max = this.priceMaxControl.value || 1000;
      this.productService.updatePriceRange([min, max]);
    });

    this.priceMaxControl.valueChanges.subscribe(max => {
      const min = this.priceMinControl.value || 0;
      this.productService.updatePriceRange([min, max]);
    });
  }

  onScroll() {
    if (this.viewport) {
      const end = this.viewport.measureScrollOffset('bottom');
      if (end < 200) { 
        this.productService.loadMore();
      }
    }
  }

}
