import {select, classNames, settings, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);

    thisCart.initActions();
    
    //console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;
    
    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      adress: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.dom.totalPrice,
      subtotalPrice: thisCart.dom.subtotalPrice,
      totalNumber: thisCart.dom.totalNumber,
      deliveryFee: thisCart.dom.deliveryFee,
      products: [],

    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
      });
  }

  add(menuProduct){
    const thisCart = this;

    /* generate html based on template */
    const generatedHTML = templates.cartProduct(menuProduct);

    /*  create const DOM using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* add element to cart */
    thisCart.dom.productList.appendChild(generatedDOM);

    //console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart.products', thisCart.products);

    thisCart.update();
  }

  update(){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let cartProduct of thisCart.products){
      
      thisCart.totalNumber = thisCart.totalNumber + cartProduct.amount;
      
      thisCart.subtotalPrice = thisCart.subtotalPrice + cartProduct.price;
    }
  
    if(thisCart.totalNumber>0){
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;  
    } else {
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
      
    }

    //console.log('deliveryFee', deliveryFee);
    //console.log('totalNumber', totalNumber);
    //console.log('subtotalPrice', subtotalPrice);
    //console.log('totalPrice', thisCart.totalPrice);

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    for (let totalPrice of thisCart.dom.totalPrice){
      totalPrice.innerHTML = thisCart.totalPrice;
    }
  }

  remove(instanceProduct) {
    const thisCart = this;

    const indexProduct = thisCart.products.indexOf(instanceProduct);
    console.log(indexProduct);

    thisCart.products.splice(indexProduct, 1);

    instanceProduct.dom.wrapper.remove();

    thisCart.update();
  }
}

export default Cart;