import { Link, useNavigate } from 'react-router-dom';
import ProductForm from './components/ProductForm';
import { ProductRequest } from '../../schemas/productSchema';
import { useMutation, useQueryClient } from 'react-query';
import { createProduct } from '../../apiClient/products';
import Swal from 'sweetalert2';

const initialValues: ProductRequest = {
  code: '',
  name: '',
  categoryId: '',
  description: '',
  price: 0,
  attributes: [],
  isDelete: false,
  image: undefined
}

const CreateProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: (product: ProductRequest) => {
      return createProduct(product);
    },
    onSuccess: async () => {
      await Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Tạo sản phẩm thành công',
        showConfirmButton: false,
        timer: 1500
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });

      navigate('/apps/products');
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message,
      });
    }
  })

  const onSubmit = async (product: ProductRequest) => {
    await mutateAsync(product);
  };

  return (
    <div className="d-flex flex-column gap-7">
      <div className="px-9">
        <Link
          to="/apps/products"
          className="fs-5 fw-bold text-gray-500 text-hover-dark d-flex align-items-center"
        >
          <i className="bi bi-arrow-left fs-2 me-2"></i>
          Quay lại danh sách sản phẩm
        </Link>
      </div>

      <div className="px-9">
        <div className="card">
          <div className="card-header border-0 pt-6">
            <h3 className="card-title align-items-start flex-column">
              <span className="card-label fw-bold fs-3 mb-1">
                Thêm sản phẩm
              </span>
            </h3>
          </div>

          <div className="card-body">
            <ProductForm initialValues={initialValues} onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}  ;

export default CreateProduct;
