import { templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

    thisBooking.bookedTable = null;
    thisBooking.starters = [];
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.tableDiv = element.querySelector('.floor-plan');
    thisBooking.dom.bookingSubmit = element.querySelector(select.booking.submit);
    thisBooking.dom.bookingPhone = element.querySelector(select.booking.phone);
    thisBooking.dom.bookingAddress = element.querySelector(select.booking.address);
    thisBooking.dom.startersCheckboxes = element.querySelectorAll(select.booking.starters);

  }

  initWidgets(){
    const thisBooking = this;
    
    thisBooking.peopleAmountElem = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerElem = new HourPicker(thisBooking.dom.hourPicker);
    
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.tableDiv.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.bookingSubmit.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });

  }

  getData(){
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePickerElem.minDate);

    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePickerElem.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'), 
      evensRepeat:    settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),  

    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.evensRepeat),

    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),

        ]);
      }) 
      .then(function([bookings, eventsCurrent, eventsRepeat ]){
        
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerElem.minDate;
    const maxDate = thisBooking.datePickerElem.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();


  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    
    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerElem.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerElem.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(event) {
    const thisBooking = this;

    const clickedTable = event.target;

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      clickedTable.classList.remove('selected');
      thisBooking.bookedTable = null;
    });
    

    if (clickedTable.classList.contains('table') &
      !clickedTable.classList.contains(classNames.booking.tableBooked) &
      !clickedTable.classList.contains('selected')) 
    {
      for (let table of thisBooking.dom.tables) {
        if (table.classList.contains('selected')) {
          table.classList.remove('selected');
        }
        clickedTable.classList.add('selected');
      }

      const clickedTableId = clickedTable.getAttribute('data-table');
      thisBooking.bookedTable = clickedTableId;

    } else if (
      clickedTable.classList.contains('table') &
      clickedTable.classList.contains(classNames.booking.tableBooked)) 
    {
      alert('This table is taken');
    } else if (clickedTable.classList.contains('table') &
      !clickedTable.classList.contains(classNames.booking.tableBooked) &
      clickedTable.classList.contains('selected')
    ) {
      clickedTable.classList.remove('selected');
    }

  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePickerElem.value,
      hour: thisBooking.hourPickerElem.value,
      table: thisBooking.bookedTable,
      duration: parseInt(thisBooking.hoursAmountElem.value),
      ppl: parseInt(thisBooking.peopleAmountElem.value),
      starters: thisBooking.starters,
      phone: thisBooking.dom.bookingPhone.value,
      address: thisBooking.dom.bookingAddress.value,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options).then(function () {
      thisBooking.makeBooked(
        payload.date,
        payload.hour,
        payload.duration,
        payload.table
      );
    });
  }

}

export default Booking;