import { useState, useEffect } from 'react';
import './App.css';

// Tipos
export type MenuItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'rapida' | 'menu';
};

export type OrderItem = MenuItem & {
  quantity: number;
};

type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';
type OrderStatus = 'preparando' | 'en_camino' | 'entregado';
type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
};

const initialMenuItems: MenuItem[] = [
  { id: 1, name: 'Hamburguesa Clásica', price: 8.99, image: '../public/img/Hamburguesa1.jpg', category: 'rapida' },
  { id: 2, name: 'Papas Fritas', price: 3.5, image: '../public/img/papasfritas.jpg', category: 'rapida' },
  { id: 3, name: 'Refresco', price: 1.99, image: '../public/img/soda.jpg', category: 'rapida' },
  { id: 4, name: 'Menú del Día: Pollo', price: 12.99, image: '../public/img/polloarroz.jpg', category: 'menu' },
];

function App() {
  const logo = '../public/img/logo de menufast icono2.png';
  const [menuItems] = useState<MenuItem[]>(initialMenuItems);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState<'todos' | 'rapida' | 'menu'>('todos');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Cargar carrito del localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const found = prev.find(i => i.id === item.id);
      if (found) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const changeQuantity = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(i =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    );
  };

  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simular procesamiento de pago
    setTimeout(() => {
      setPaymentConfirmed(true);
      
      // Crear el pedido
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        items: [...cart],
        total: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'preparando',
        createdAt: new Date()
      };
      
      setCurrentOrder(newOrder);
      
      setTimeout(() => {
        setPaymentConfirmed(false);
        setShowPaymentModal(false);
        setCart([]);
        localStorage.removeItem('cart');
        
        // Simular cambio de estado después de 5 segundos
        setTimeout(() => {
          setCurrentOrder(prev => prev ? {...prev, status: 'en_camino'} : null);
        }, 5000);
        
        // Simular entrega después de 10 segundos
        setTimeout(() => {
          setCurrentOrder(prev => prev ? {...prev, status: 'entregado'} : null);
        }, 10000);
      }, 2000);
    }, 1500);
  };

  const filteredMenu = filter === 'todos' ? menuItems : menuItems.filter(i => i.category === filter);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="app">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Menu Fast</h1>
      </header>

      <div className="filters">
        <button onClick={() => setFilter('todos')}>Todos</button>
        <button onClick={() => setFilter('rapida')}>Comida Rápida</button>
        <button onClick={() => setFilter('menu')}>Menú del Día</button>
      </div>

      <section className="menu">
        <h2>Menú</h2>
        <div className="menu-grid">
          {filteredMenu.map(item => (
            <div key={item.id} className="menu-item">
              <img src={item.image} alt={item.name} className="item-image" />
              <h3>{item.name}</h3>
              <p>S/.{item.price.toFixed(2)}</p>
              <button onClick={() => addToCart(item)}>Añadir</button>
            </div>
          ))}
        </div>
      </section>

      <section className="cart">
        <h2>Carrito ({cart.length})</h2>
        {cart.length === 0 ? (
          <p>No hay items en el carrito</p>
        ) : (
          <>
            <div className="cart-table-container">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} className="cart-item">
                      <td>
                        <div className="cart-item-info">
                          <img src={item.image} alt={item.name} className="cart-image" />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="quantity-controls">
                          <button onClick={() => changeQuantity(item.id, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeQuantity(item.id, 1)}>+</button>
                        </div>
                      </td>
                      <td>S/.{(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="remove-btn"
                          aria-label="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="cart-total">
                    <td colSpan={2}>Total:</td>
                    <td colSpan={2}>S/.{total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Confirmar Pedido
            </button>
          </>
        )}
      </section>

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            {!paymentConfirmed ? (
              <>
                <h2>Método de Pago</h2>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="form-group">
                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'efectivo'}
                        onChange={() => setPaymentMethod('efectivo')}
                      />
                      Efectivo
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'tarjeta'}
                        onChange={() => setPaymentMethod('tarjeta')}
                      />
                      Tarjeta
                    </label>
                    {paymentMethod === 'tarjeta' && (
                      <input
                        type="text"
                        placeholder="Número de tarjeta"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'transferencia'}
                        onChange={() => setPaymentMethod('transferencia')}
                      />
                      Transferencia
                    </label>
                  </div>
                  <div className="modal-buttons">
                    <button type="button" onClick={() => setShowPaymentModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="confirm-btn">
                      Confirmar Pago
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="payment-confirmed">
                <h2>✅ Pago Confirmado</h2>
                <p>Gracias por tu compra!</p>
                <p>Tu pedido está siendo preparado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Estado del Pedido */}
      {currentOrder && (
        <div className="order-status-modal">
          <div className="order-status-container">
            <h2>Estado de tu Pedido #{currentOrder.id}</h2>
            
            <div className="status-timeline">
              <div className={`status-step ${currentOrder.status === 'preparando' ? 'active' : ''} ${currentOrder.status === 'en_camino' || currentOrder.status === 'entregado' ? 'completed' : ''}`}>
                <div className="step-icon">👨‍🍳</div>
                <div className="step-label">Preparando</div>
              </div>
              
              <div className={`status-step ${currentOrder.status === 'en_camino' ? 'active' : ''} ${currentOrder.status === 'entregado' ? 'completed' : ''}`}>
                <div className="step-icon">🚚</div>
                <div className="step-label">En camino</div>
              </div>
              
              <div className={`status-step ${currentOrder.status === 'entregado' ? 'active' : ''}`}>
                <div className="step-icon">✅</div>
                <div className="step-label">Entregado</div>
              </div>
            </div>
            
            <div className="order-details">
              <h3>Detalles del pedido:</h3>
              <ul>
                {currentOrder.items.map(item => (
                  <li key={item.id}>
                    {item.name} x {item.quantity} - S/.{(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
              <div className="order-total">
                Total: S/.{currentOrder.total.toFixed(2)}
              </div>
            </div>
            
            <button 
              className="close-status-btn" 
              onClick={() => setCurrentOrder(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;