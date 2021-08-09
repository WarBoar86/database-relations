import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const products = await this.ormRepository.findOne({
      where: { name },
    });

    return products;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    const producstId = products.map(p => p.id);

    const productsList = await this.ormRepository.find({
      where: {
        id: In(producstId),
      },
    });

    return productsList;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO

    const uListProducts: Product[] = [];

    products.forEach(async pd => {
      const fProuct = await this.ormRepository.findOne({
        where: {
          id: pd.id,
        },
      });
      if (fProuct !== undefined && fProuct.quantity >= pd.quantity) {
        fProuct.quantity -= pd.quantity;
        uListProducts.push(fProuct);
      }
    });

    return uListProducts;
  }
}

export default ProductsRepository;
