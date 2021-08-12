import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customer = await this.customersRepository.findById(customer_id);
    const storagedProducts = await this.productsRepository.findAllById(
      products,
    );

    if (!customer) {
      throw new AppError('Customer not found');
    }

    if (storagedProducts.length === 0) {
      throw new AppError('No products matches');
    }

    const productsToUpdate: IProduct[] = products.map((p, index) => {
      if (storagedProducts[index].quantity < p.quantity) {
        throw new AppError('Insuficient products quantity');
      }
      return {
        id: p.id,
        quantity: p.quantity,
      };
    });

    const checkedQtdProducts = await this.productsRepository.updateQuantity(
      productsToUpdate,
    );

    const orderProducts = checkedQtdProducts.map((e, index) => {
      return {
        product_id: e.id,
        price: e.price,
        quantity: products[index].quantity,
      };
    });

    const newOrder = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return newOrder;
  }
}

export default CreateOrderService;
