/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };
  
  class Product{
    constructor(id, data){
      //console.log('constructor');
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      

      thisProduct.renderInMenu();
      //console.log('renderInMenu');
      thisProduct.getElements();
      //console.log('getElements');
      thisProduct.initAccordion();
      //console.log('initAccordion');
      thisProduct.initOrderForm();
      //console.log('initOrderForm');
      thisProduct.initAmountWidget();
      console.log('initAmountWidget');
      thisProduct.processOrder();
      //console.log('processOrder');

      //console.log('new Product:', thisProduct);
    }
    
    renderInMenu(){
      const thisProduct = this;
      //console.log('thisProduct/this in renderInMenu():', thisProduct);

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log('generatedHTML:', generatedHTML);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //console.log('thisProduct.element:', thisProduct.element);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      //console.log('menuContainer:', menuContainer);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
      //console.log('add element to menu');
    }

    getElements(){
      const thisProduct = this;
      //console.log('thisProduct in getElements():', thisProduct);
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      //console.log('thisProduct in initAccordion():', thisProduct);

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log('clickableTrigger:', clickableTrigger);

      /* START: add event listener to clickable trigger on event click */
      //clickableTrigger.addEventListener('click', function(event){
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        //console.log('Product was clicked!');
        /* prevent default action for event */
        event.preventDefault();
        //console.log('event = ', event);

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        //console.log('activeProduct:', activeProduct);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != null && activeProduct != thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          //console.log('if there is active product and its not thisProduct element, remove class active from it');
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        //console.log('toggle active class on thisProduct.element');
      });

    }

    initOrderForm(){
      const thisProduct = this;
      //console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;
      //console.log('processOrder');

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = (formData[paramId] && formData[paramId].includes(optionId));

          if(optionSelected) {
            // check if the option is not default
            if (!option.deafult) {
              //add option price to price variable
              price += option.price;
            }
          }
          else {
          //check if the option is default
            if (option.deafult) {
            //reduce price variable
              price = option.price;
            }
          }

          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          
          if(optionImage){
            // Yes! We've found it!
            if(optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);    
            }
          }
        }
      }
      /*multiply price by amount */
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor arguments: ', element);

      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();

    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    announce(){
      const thisWidget = this;

      const event = new Event ('updated');
      thisWidget.element.dispatchEvent(event);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      const maxValue = settings.amountWidget.defaultMax;
      const minValue = settings.amountWidget.defaultMin;

      /* TODO: Add validation */
      if((thisWidget.value !== newValue && !isNaN(newValue)) && newValue >= minValue && newValue <= maxValue){
        thisWidget.value = newValue;
      } 

      
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue ((thisWidget.value - 1));
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue ((thisWidget.value + 1));
      });
    }

  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      
      console.log('new Cart', thisCart);
    }

    
    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      
    }

    initActions(){
      const thisCart = this;
      
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      //thisCart.dom.productList.addEventListener('updated', function(){
      //thisCart.update();
      //});
      //thisCart.dom.productList.addEventListener('remove', function(event){
      //thisCart.remove(event.detail.cartProduct);
      //});
    }

  }

  const app = {

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },


    initMenu: function(){
      //console.log('initMenu:', app.initMenu);
      const thisApp = this;

      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
        //console.log('new Product');
      }
    },

    initData: function(){
      const thisApp = this;
      //console.log('thisApp/this in initData():', thisApp);

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      //console.log('initData()');
      thisApp.initMenu();
      //console.log('initMenu()');
      thisApp.initCart();
      console.log('initCart()');

    },
  }; 

  app.init();
  //console.log('init()');
  
}
