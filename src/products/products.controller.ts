import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Decimal } from '@prisma/client/runtime/library';

@Controller('products')
export class ProductsController {
    constructor(private productService: ProductsService){}

    @Post()
    async createProduct(@Body() product: {
            name: string; 
            sku: string; 
            description: string; 
            price: Decimal; 
            stockQuantity: number
        }){
            return this.productService.createProduct(product);
    }

    @Get()
    async getAllProducts() {
        return this.productService.getAllProducts()
    }

    @Get(':id')
    async getProductById(@Param('id') productId: string){
        return this.productService.getProductById(productId);
    }
    
    @Delete(':id')
    async deleteProductById(@Param('id') productId: string){
        return this.productService.deleteProductById(productId);
    }

    @Patch(':id')
    async updateProductById(
        @Param('id') productId: string, 
        @Body() productUpdate: {
            name: string;
            sku: string;
            description: string;
            price: Decimal;
            stockQuantity: number
    }){
        return this.productService.updateProductById(productId, productUpdate);
    }
}
