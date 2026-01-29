package clients

import (
	"bytes"
	"checkout-service/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type FastAPIClient struct {
	baseURL string
	client  *http.Client
}

func NewFastAPIClient(baseURL string) *FastAPIClient {
	return &FastAPIClient{
		baseURL: baseURL,
		client:  &http.Client{},
	}
}

func (c *FastAPIClient) GetProduct(productID int) (*models.Product, error) {
	url := fmt.Sprintf("%s/api/products/%d", c.baseURL, productID)

	resp, err := c.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to get product: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get product: status %d, body: %s", resp.StatusCode, string(body))
	}

	var product models.Product
	if err := json.NewDecoder(resp.Body).Decode(&product); err != nil {
		return nil, fmt.Errorf("failed to decode product: %w", err)
	}

	return &product, nil
}

func (c *FastAPIClient) CreateOrder(orderReq models.OrderCreateRequest, token string) (*models.OrderResponse, error) {
	url := fmt.Sprintf("%s/api/orders", c.baseURL)

	jsonData, err := json.Marshal(orderReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal order: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to create order: status %d, body: %s", resp.StatusCode, string(body))
	}

	var orderResp models.OrderResponse
	if err := json.NewDecoder(resp.Body).Decode(&orderResp); err != nil {
		return nil, fmt.Errorf("failed to decode order response: %w", err)
	}

	return &orderResp, nil
}

func (c *FastAPIClient) CreateGuestOrder(orderReq models.OrderCreateRequest) (*models.OrderResponse, error) {
	url := fmt.Sprintf("%s/api/orders/guest", c.baseURL)

	jsonData, err := json.Marshal(orderReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal order: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to create guest order: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to create guest order: status %d, body: %s", resp.StatusCode, string(body))
	}

	var orderResp models.OrderResponse
	if err := json.NewDecoder(resp.Body).Decode(&orderResp); err != nil {
		return nil, fmt.Errorf("failed to decode order response: %w", err)
	}

	return &orderResp, nil
}

func (c *FastAPIClient) ClearCart(token string) error {
	url := fmt.Sprintf("%s/api/cart/clear", c.baseURL)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to clear cart: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to clear cart: status %d, body: %s", resp.StatusCode, string(body))
	}

	return nil
}
