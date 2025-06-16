import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductForm, {
  ProductFormInitialValues,
  ProductFormRequest,
} from './components/ProductForm';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getProduct, updateProduct } from '../../apiClient/products';
import Swal from 'sweetalert2';

const EditProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  const { mutateAsync } = useMutation({
    mutationFn: (product: ProductFormRequest) => {
      return updateProduct(id!, product);
    },
    onSuccess: async () => {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật sản phẩm thành công',
        showConfirmButton: false,
        timer: 1500,
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });

      navigate('/apps/products');
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message,
      });
    },
  });

  const onSubmit = async (product: ProductFormRequest) => {
    await mutateAsync(product);
  };

  if (!product || isLoading) {
    return (
      <span
        className='spinner-border spinner-border-sm'
        role='status'
        aria-hidden='true'
      ></span>
    );
  }

  const initialValues: ProductFormInitialValues = {
    code: product.code,
    name: product.name,
    categoryId: product.categoryId,
    description: product.description,
    price: product.price,
    attributes: product.attributes,
    isDelete: product.isDelete,
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
                Cập nhật sản phẩm
              </span>
            </h3>
          </div>

          <div className="card-body">
            <ProductForm
              initialValues={initialValues}
              onSubmit={onSubmit}
              isEdit={true}
              imageUrl={product.imageId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
