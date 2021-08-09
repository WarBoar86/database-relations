import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IRequest {
  id: string;
}

@injectable()
class FindOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository, // @inject('ProductsRepository') // private productsRepository: IProductsRepository, // @inject('CustomersRepository') // private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ id }: IRequest): Promise<Order | undefined> {
    // TODO
    const foundOrder = await this.ordersRepository.findById(id);

    if (!foundOrder) {
      throw new AppError('Order not found');
    }

    return foundOrder;
  }
}

export default FindOrderService;
