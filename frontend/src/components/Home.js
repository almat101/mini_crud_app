import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Modal,
  Form,
} from "react-bootstrap";

const isDev = process.env.REACT_APP_IS_DEV === "true";
const URL = isDev ? "http://localhost:3020/api/products/public/" : "/api/products/public/";

//invocazione dell interceptor che aggiunge il token bearer ad ogni richiesta
// Interceptor();

const HomePage = () => {
  const [products, setProducts] = useState([]); // List of all products
  const [addFormData, setAddFormData] = useState({
    name: "",
    price: "",
    category: "",
    user_id: "",
  }); // For POST
  const [message, setMessage] = useState(""); // Success/Error messages
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const commonCategories = [
    "Electronics",
    "Furniture",
    "Accessories",
    "Clothing",
    "Home",
    "Sports",
    "Toys",
    "Beauty",
  ];
  const [categories] = useState(commonCategories);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${URL}`, {
        withCredentials: true,
      });
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setMessage("Failed to fetch products");
    }
  }, []);

  const handleShowAddModal = (productId) => {
    setSelectedProductId(productId);
    setShowAddModal(true);
  };

//   // Add a new product
//   const addProduct = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${URL}`, addFormData, {
//         withCredentials: true,
//       });
//       setMessage("Product added successfully!");
//       console.log(response);
//       fetchProducts(); // Refresh the product list
//       setAddFormData({ name: "", price: "", category: "", user_id: "" });
//     } catch (error) {
//       setMessage("Failed to add product");
//     } finally {
//       setShowAddModal(false);
//     }
//   };

//   const handleShowDeleteModal = (productId) => {
//     setSelectedProductId(productId);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       await axios.delete(`${URL}/${selectedProductId}`, {
//         withCredentials: true,
//       });
//       setMessage("Product deleted successfully!");
//       fetchProducts(); // Refresh the product list
//     } catch (error) {
//       setMessage("Failed to delete product");
//     } finally {
//       setShowDeleteModal(false);
//     }
//   };

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <Container>
      {/* <h1>Product Management</h1> */}
      {message && <Alert variant="info">{message}</Alert>}
      <Row>
        {products.length > 0 ? (
          products.map((product) => (
            <Col key={product.id} sm={12} md={6} lg={4} className="mb-4">
              <Card style={{ width: "18rem" }}>
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    ${product.price}
                  </Card.Subtitle>
                  <Card.Text>Category: {product.category}</Card.Text>

                  {/* <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleShowAddModal(product.id)}
                  >
                    Add
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleShowDeleteModal(product.id)}
                  >
                    Delete
                  </Button> */}
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <div className="text-center">
            <p>No products available</p>
            {/* <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add Product
            </Button> */}
          </div>
        )}
      </Row>
</Container>
)};

export default HomePage;
