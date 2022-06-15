/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
  
  class Product{
    constructor(id, data){
      console.log('constructor');
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;
      

      thisProduct.renderInMenu();
      console.log('renderInMenu');
      thisProduct.getElements();
      console.log('getElements');
      thisProduct.initAccordion();
      console.log('initAccordion');

      console.log('new Product:', thisProduct);
    }
    
    renderInMenu(){
      const thisProduct = this;
      console.log('thisProduct/this in renderInMenu():', thisProduct);

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      console.log('generatedHTML:', generatedHTML);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      console.log('thisProduct.element:', thisProduct.element);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      console.log('menuContainer:', menuContainer);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
      console.log('add element to menu');
    }

    getElements(){
      const thisProduct = this;
      console.log('thisProduct in getElements():', thisProduct);
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }

    initAccordion(){
      const thisProduct = this;
      console.log('thisProduct in initAccordion():', thisProduct);

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      console.log('clickableTrigger:', clickableTrigger);

      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function(event){

        //thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        console.log('Product was clicked!');
        console.log('event = ', event);
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        console.log('activeProduct:', activeProduct);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != null && activeProduct != thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          console.log('if there is active product and its not thisProduct element, remove class active from it');
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        console.log('toggle active class on thisProduct.element');
      });

    }
  }

  const app = {
    initMenu: function(){
      console.log('initMenu:', app.initMenu);
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
        console.log('new Product');
      }
    },

    initData: function(){
      const thisApp = this;
      console.log('thisApp/this in initData():', thisApp);

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      console.log('initData()');
      thisApp.initMenu();
      console.log('initMenu()');
    },
  }; 

  app.init();
  console.log('init()');
  
}
