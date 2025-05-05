import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import styles from './InfoListCard.module.css';

// items expected: array of objects like { id: 'someId', name: 'Product Name' }
const InfoListCard = ({ title, items = [], baseLinkPath = '/product-details/', emptyMessage = "No items to display." }) => {
  return (
    <div className={styles.listCard}>
      <h3 className={styles.listTitle}>{title}</h3>
      {items.length > 0 ? (
        <ul className={styles.itemList}>
          {items.map((item) => (
            <li key={item.id} className={styles.listItem}>
              {/* Make item clickable, linking to its detail page */}
              <Link to={`${baseLinkPath}${item.id}`}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      )}
    </div>
  );
};

export default InfoListCard;