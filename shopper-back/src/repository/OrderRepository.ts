import { Order } from "../entity/Order";
import { connection } from "../connection";
import { Product } from "../entity/Product";
import { ProductsRepository } from "./ProductsRepository";

export class OrderRepository {

    private productRepository: ProductsRepository

    constructor() {
        this.productRepository = new ProductsRepository()
    }

    create = async (order: Order): Promise<any> => {
        try {
            const result = await connection.insert({
                customer_name: order.customerName,
                delivery_date: order.deliveryDate,
                total: order.total
            }).table('shopper_order')
            console.log(order.products)
            this.insertItems(result[0], order.products)
            console.log("Order was created succesfully.")

            return result
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
    }


    listAll = async (): Promise<any> => {
        try {
            const result = await connection
                .select('id', 'customer_name as customerName', 'delivery_date as deliveryDate', 'total')
                .table('shopper_order')
                console.log(result)
            return result
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
    }

    private insertItems = async (orderId: Number, products: Product[]) : Promise<any> => {
        products.forEach(product => {
            connection.insert({
                order_id: orderId,
                product_id: product.id,
                qty: product.quantityOrder
            }).table('shopper_order_products')
                .then(() => {
                    console.log(`Item ${product.id} was inserted succefully.`)
                    this.productRepository.updateStock('-', product.id, product.quantityOrder)
                })
                .catch(err => {
                    console.log("Error on insert order")
                    console.log(err)
                })
        })
    }


}