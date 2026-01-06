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
const URL = isDev ? "http://localhost:3020/api/products/my-home/" : "/api/products/my-home/";

//invocazione dell interceptor che aggiunge il token bearer ad ogni richiesta
// Interceptor();

const MyHome = () => {
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
      console.log("test")
    }
  }, []);

  const handleShowAddModal = (productId) => {
    setSelectedProductId(productId);
    setShowAddModal(true);
  };

  // Add a new product
  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${URL}`, addFormData, {
        withCredentials: true,
      });
      setMessage("Product added successfully!");
      console.log(response);
      fetchProducts(); // Refresh the product list
      setAddFormData({ name: "", price: "", category: "", user_id: "" });
    } catch (error) {
      setMessage("Failed to add product");
    } finally {
      setShowAddModal(false);
    }
  };

  const handleShowDeleteModal = (productId) => {
    setSelectedProductId(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${URL}/${selectedProductId}`, {
        withCredentials: true,
      });
      setMessage("Product deleted successfully!");
      fetchProducts(); // Refresh the product list
    } catch (error) {
      setMessage("Failed to delete product");
    } finally {
      setShowDeleteModal(false);
    }
  };

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

                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleShowAddModal(product.id)}
                  >
                    Add to chart
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleShowDeleteModal(product.id)}
                  >
                    Delete from chart
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <div className="text-center">
            <p>No products available</p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add Product
            </Button>
          </div>
        )}
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this product?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add a New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={addProduct}>
            <Form.Group className="mb-3" controlId="formProductName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={addFormData.name}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formProductPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter product price"
                value={addFormData.price}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, price: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formProductCategory">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={addFormData.category}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, category: e.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* <Form.Group className="mb-3" controlId="formProductUserId">
              <Form.Label>User ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter user ID"
                value={addFormData.user_id}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, user_id: e.target.value })
                }
              />
            </Form.Group> */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" onClick={addProduct}>
            Add Product
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyHome;
