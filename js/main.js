angular.module('invoicing', [])

// The default logo for the invoice
.constant('DEFAULT_LOGO', 'images/metaware_logo.png')

// The invoice displayed when the user first uses the app
.constant('DEFAULT_INVOICE', {
  tax: 8.00,
  invoice_number: 1,
  customer_info: {
    name: '',
    web_link: '',
    address1: '',
    NIP: '',
    platnosc: 'Forma płatności: gotówka'
  },
  company_info: {
    name: 'NAZWA: WiR Urszula Szczerbowska',
    web_link: 'EMAIL: www.wir-noclegi.pl',
    address1: 'ADRES: ul. Wadowicka 44, Poręba Wielka ',
    postal: 'POCZTA: 32-600 Oświęcim, Polska',
    miejsce_sell: 'Oświęcim',
    data_wystawienia: new Date().toISOString().slice(0,10),
    data_sell: new Date().toISOString().slice(0,10),
    NIP: 'NIP: 587-000-09-66',

    bank: 'BANK: PKO BP 74 1020 2384 0000 9502 0095 6607'
  },
  items:[
    { qty: 10,pkwiu:'55-20-Z', description: 'Noclegi', cost: 0,pobyt: 1,grupa:1,vat:8 }
  ]
})

// Service for accessing local storage
.service('LocalStorage', [function() {

  var Service = {};

  // Returns true if there is a logo stored
  var hasLogo = function() {
    return !!localStorage['logo'];
  };

  // Returns a stored logo (false if none is stored)
  Service.getLogo = function() {
    if (hasLogo()) {
      return localStorage['logo'];
    } else {
      return false;
    }
  };

  Service.setLogo = function(logo) {
    localStorage['logo'] = logo;
  };

  // Checks to see if an invoice is stored
  var hasInvoice = function() {
    return !(localStorage['invoice'] == '' || localStorage['invoice'] == null);
  };

  // Returns a stored invoice (false if none is stored)
  Service.getInvoice = function() {
    if (hasInvoice()) {
      return JSON.parse(localStorage['invoice']);
    } else {
      return false;
    }
  };

  Service.setInvoice = function(invoice) {
    localStorage['invoice'] = JSON.stringify(invoice);
  };

  // Clears a stored logo
  Service.clearLogo = function() {
    localStorage['logo'] = '';
  };

  // Clears a stored invoice
  Service.clearinvoice = function() {
    localStorage['invoice'] = '';
  };

  // Clears all local storage
  Service.clear = function() {
    localStorage['invoice'] = '';
    Service.clearLogo();
  };

  return Service;

}])

.service('Currency', [function(){

  var service = {};

  service.all = function() {
    return [
      {
        name: 'British Pound (£)',
        symbol: '£'
      },
      {
        name: 'Canadian Dollar ($)',
        symbol: 'CAD $ '
      },
      {
        name: 'Euro (€)',
        symbol: '€'
      },
      {
        name: 'Indian Rupee (₹)',
        symbol: '₹'
      },
      {
        name: 'Norwegian krone (kr)',
        symbol: 'kr '
      },
      {
        name: 'US Dollar ($)',
        symbol: '$'
      }
    ]
  }

  return service;
  
}])

.filter('format_currency', function() {
   return function(val){
     //var RegExp = /(\d)(?=(\d\d\d)+(?!\d))/;
    // var match = RegExp.exec(val);
    // return match[1];
    return val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1 ");
   };
})
// Main application controller
.controller('InvoiceCtrl', ['$scope', '$http', 'DEFAULT_INVOICE', 'DEFAULT_LOGO', 'LocalStorage', 'Currency',
  function($scope, $http, DEFAULT_INVOICE, DEFAULT_LOGO, LocalStorage, Currency) {
  // $scope.user = {'author': "nobody@flickr.com (gh John Doe)"};
  // Set defaults
  $scope.currencySymbol = 'zł';
  $scope.logoRemoved = false;
  $scope.printMode   = false;

  (function init() {
    // Attempt to load invoice from local storage
    !function() {
      var invoice = LocalStorage.getInvoice();
      $scope.invoice = invoice ? invoice : DEFAULT_INVOICE;
     // $scope.invoice = DEFAULT_INVOICE;
    }();

    // Set logo to the one from local storage or use default
    !function() {
      var logo = LocalStorage.getLogo();
      $scope.logo = logo ? logo : DEFAULT_LOGO;
    }();

    $scope.availableCurrencies = Currency.all();

  })()
  // Adds an item to the invoice's items
  $scope.addItem = function() {
    $scope.invoice.items.push({qty: 10,pkwiu:'55-20-Z', description: 'Noclegi', cost: 0,pobyt: 1,grupa:1,vat:8  });
  }

  // Toggle's the logo
  $scope.toggleLogo = function(element) {
    $scope.logoRemoved = !$scope.logoRemoved;
    LocalStorage.clearLogo();
  };

  // Triggers the logo chooser click event
  $scope.editLogo = function() {
    // angular.element('#imgInp').trigger('click');
    document.getElementById('imgInp').click();
  };

  $scope.printInfo = function() {
    window.print();
  };

  // Remotes an item from the invoice
  $scope.removeItem = function(item) {
    $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
  };

  // Calculates the sub total of the invoice
  $scope.invoiceSubTotal = function() {
    var total = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
      total += (item.cost*1);
    });
    $scope.invoiceSubTotal_value = total.toFixed(2);
    return total.toFixed(2);
  };
  $scope.invoiceSubNetto = function() {
    var total = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
      total += (item.cost*1)/(1+ item.vat/100 );
    });
    $scope.invoiceSubNetto_value = total;
    return total.toFixed(2);
  };
  $scope.invoiceSubTax = function() {
    var total = $scope.invoiceSubTotal_value -  $scope.invoiceSubNetto_value;
  /*  angular.forEach($scope.invoice.items, function(item, key){
      total += (item.cost*1 -  ((item.cost*1)/(1+ item.vat/100 )).toFixed(2)).toFixed(2);
    });
    */

    return total.toFixed(2);
  };

 $scope.inWords = function(liczba) {
    num = Math.floor(liczba);
    var decimal = ((liczba - num)*100).toFixed(0);
    var a = ['','jeden ','dwa ','trzy ','cztery ', 'pięć ','sześć ','sidem ','osiem ','dziewięć ','dziesięć ','jedenaście ','dwanaście ','trzynaście ','czternaście ','piętnaście ','szesnaście ','siedemnaście '
    ,'osiemnaście ','dziewętnaście '];
    var b = ['', '', 'dwadzieścia','trzydzieści','czterdzieści','pięćdziesiąt', 'sześćdziesiąt','siedemdziesiąt','osiemdziesiąt','dziewięćdziesiąt'];
    var ccc = ['','sto','dwieście','trzysta', 'czterysta','pięćset','sześćset','siedemset','osiemset', 'dziewięćset'];
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    var num_bit = num.toString().replace('0','1');
    var n_check = ('000000000' + num_bit).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n_check[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' ' : '';
    //str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'tyś. ' : '';
    str += (n_check[2] != 0) ? (ccc[Number(n[2])]) + (( n[3] != 0) ? ' ' : ' tyś. ') : '';
    str += (n_check[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'tyś. ' : '';
  //  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' ' : '';
    str += (n_check[4] != 0) ? (ccc[Number(n[4])]) + ' ' : '';
    str += (n_check[5] != 0) ? ((str != '') ? ' ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + ' zł ' + decimal+ '/100' : '';
    return str;
}
  $scope.slownieGrandTotal = function() {
    var total = $scope.invoiceSubTotal_value;
    return $scope.inWords(total);
  };
  // Calculates the tax of the invoice
  $scope.calculateNetto = function() {
    return $scope.invoiceSubNetto();
  };
  $scope.calculateTax = function() {
    return $scope.invoiceSubTax();
  };

  // Calculates the grand total of the invoice
  $scope.calculateGrandTotal = function() {
    saveInvoice();
    return $scope.invoiceSubTotal();
  };

  // Clears the local storage
  $scope.clearLocalStorage = function() {
    var confirmClear = confirm('Are you sure you would like to clear the invoice?');
    if(confirmClear) {
      LocalStorage.clear();
      setInvoice(DEFAULT_INVOICE);
    }
  };

 
  // Sets the current invoice to the given one
  var setInvoice = function(invoice) {
    $scope.invoice = invoice;
    saveInvoice();
  };

  // Reads a url
  var readUrl = function(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById('company_logo').setAttribute('src', e.target.result);
        LocalStorage.setLogo(e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
  };

  // Saves the invoice in local storage
  var saveInvoice = function() {
    LocalStorage.setInvoice($scope.invoice);
  };

  // Runs on document.ready
   
  angular.element(document).ready(function () {
    // Set focus
  
    document.getElementById('invoice-number').focus();
   /* document.getElementById('invoice-number').onchange = function() {
      this.value = this.value + '/N/'+new Date().getFullYear();
    };
    document.getElementById('invoice.customer_info.name').onchange = function() {
      this.value = 'NAZWA: ' + this.value;
    };
     document.getElementById('invoice.customer_info.address1').onchange = function() {
      this.value = 'ADRES: ' + this.value;
    };
    */
    
  });

}])
