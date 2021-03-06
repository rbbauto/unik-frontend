import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { I_compra } from '../models/Compra.interface';
import { I_envio } from '../models/Envio.interface';


@Component({
  selector: 'app-finalizar-compra',
  templateUrl: './finalizar-compra.component.html',
  styleUrls: ['./finalizar-compra.component.css']
})
export class FinalizarCompraComponent implements OnInit {

  // globales
  constructor(public appRoot:AppComponent) { }

  ngOnInit(){
    this.getPedido();
    this.getCostoEnvio(this.Pedido.codigoPostal);
    this.getStorageCostoEnvio();
  }
  

  // propiedades y metodos de esta clase
  matTabChoose:number=0;
  metodoEnvio:string;
  metodoPago:string;
  step_4:boolean=false;
  showDetailsPago:boolean=false;
  Envio:I_envio={
    metodo:"",
    costo:0
  }
  
  Pedido={
    nombre:"",
    apellido:"",
    email:"",
    contrasenia:"",
    empresa:"",
    cuitCuilDni:0,
    direccion:"",
    numero:0,
    codigoPostal:0,
    ciudad:"",
    provincia:"",
    pais:"",
    telefono:"",
    esDireccionParaFacturacion:true

  }

 
  checkLogin(user,pass,stepper):any{
    this.appRoot.ajaxQuery.getLoginService(user,pass).subscribe(
      login => {
        if(login != null){
          this.Pedido=login;
          this.storePedido();
          setTimeout(() => {this.changeStep(2,stepper)},1000);
        }
        else{
          alert('Email o Contraseña incorrecto/a\n\
          Puede comprar sin registrarse como invitado\n\
          o registrarse completando el formulario en la solapa:\n\n\
          "Comprar Como Invitado / Registrarse!"');
          this.matTabChoose=1;
        }
      }
      
    );
  }
  
  
  storePedido():void{
    localStorage.setItem('Pedido',JSON.stringify(this.Pedido));
  }
  setPedido(){
    this.appRoot.ajaxQuery.setPedidoService(this.Pedido)
      .subscribe(
        pedido => {
          console.log('pedido Service: ',pedido);
        }
    );
  }
  getPedido():void{
    this.Pedido= JSON.parse(localStorage.getItem("Pedido")) != null 
                  ?
                    JSON.parse(localStorage.getItem("Pedido")) 
                  :   
                    this.Pedido;
  }
  setCompra(stepper){
    let envio:I_envio={
      costo:this.costoEnvio,
      metodo: this.metodoEnvio
    }
    let compra:I_compra={
      
      Productos:this.appRoot.Dcarrito,
      Pedido: this.Pedido,
      Envio: envio
    }
    this.appRoot.ajaxQuery.setCompraService(compra)
    .subscribe(
      compra =>{
        if(this.metodoEnvio != undefined){
          this.step_4=true;
          setTimeout(()=> this.changeStep(3,stepper),1000);
        }
 
      },
      error => {
        alert('Error al procesar envio\npor favor notifique al administrador');
      }
    );
    
  }

  setPago(){
    let envio:I_envio={
      costo:this.costoEnvio,
      metodo: this.metodoEnvio
    }
    let compra:I_compra={
      
      Productos:this.appRoot.Dcarrito,
      Pedido: this.Pedido,
      Envio: envio
    }
    this.appRoot.ajaxQuery.setPagoService(compra).subscribe(
      pago => {
        let respuesta = document.getElementById("respuesta");
        respuesta.innerHTML = pago;
        this.showDetailsPago=true;
      },
      error => {
        console.log('Error!');
      }
    );
  }
  // forms methods
  step_1(){
    return  (this.Pedido.email !== "") && (this.Pedido.nombre !== "") && 
            (this.Pedido.apellido !== "");
 
  }
  step_2(){
    return  (this.Pedido.nombre !== "")           &&  (this.Pedido.apellido !== "") && 
            (this.checkEmail(this.Pedido.email))  &&  (this.Pedido.cuitCuilDni > 1000000) && 
            (this.Pedido.direccion !== "")        &&  (!isNaN(this.Pedido.numero))  &&  
            (this.Pedido.codigoPostal > 1000)     &&  (this.Pedido.ciudad !== "")  &&
            (this.Pedido.provincia !== "")        &&  (this.Pedido.pais !== "");
 
  }
  step_3(){
    return (this.metodoEnvio != undefined) && (this.step_4 == true);
  }
  
  changeStep(step,stepper){
    stepper.selectedIndex=step;
  }
  checkNumber(num){
    return isNaN(num.value);
  }
  checkEmail(email){
    let emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return !emailRegex.test(email.value);
  }
  mandatory(input){
    return input.value.length === 0;
  }
  // mismos metodos y propiedades que en carrito, para mostrar Resumen de compra
  codigoPostal:number=0;
  costoEnvio:number=0;
  tiempoDeEnvioEstimado:string;
  meses:string[] = ["Enero", "Febrero", "Marzo", "Abril", "Mayo","Junio","Julio","Agosto", "Septiembre","Noviembre","Diciembre"];

  getSubtotal(id,precio,cantidad){
    this.appRoot.Dcarrito[id].subtotal=(parseFloat(precio)*cantidad);
    localStorage.setItem('Items',JSON.stringify(this.appRoot.Dcarrito));
    localStorage.setItem('cartTotalItems',JSON.stringify(this.getTotalItemsWithSubtotal()));
    this.appRoot.cartTotalItems=this.getTotalItemsWithSubtotal();
  }

  delItem(id){
    console.log(id);
    this.appRoot.Dcarrito.splice(id,id+1);
    this.appRoot.cartTotalItems=this.appRoot.Dcarrito.length
    localStorage.setItem('Items',JSON.stringify(this.appRoot.Dcarrito));
    localStorage.setItem('cartTotalItems',JSON.stringify(this.appRoot.Dcarrito.length));
  }

  getTotalItemsWithSubtotal(){
    let total:number=0;
    this.appRoot.Dcarrito.forEach(
      element => total+=element.cantidad
    );
    return total
  }
  getTotalPriceItemsWithSubtotal(){
    let total:number=0;
    this.appRoot.Dcarrito.forEach(
      element => total+=parseFloat(element.subtotal)
    );
    return total
  }
  getStorageCostoEnvio(){
    this.Envio= JSON.parse(localStorage.getItem("Envio")) != null 
                  ?
                    JSON.parse(localStorage.getItem("Envio")) 
                  :   
                    this.Envio;

  }
  getCostoEnvio(cp):number{
    if(cp == 0)  return;
    let costo:number=0;
    this.appRoot.ajaxQuery.getCostoEnvio(cp).subscribe(
      envio => {
        let fecha= new Date(envio.options[0].estimated_delivery_time.date);
        let mes= this.meses[fecha.getMonth()];
				let dia= fecha.getDate();
        this.costoEnvio=envio.options[0].cost;
        this.tiempoDeEnvioEstimado="llega el " + dia + " de " + mes;
        let methodShip:any={
          "metodo":this.metodoEnvio,
          "costo":envio.options[0].cost};
        localStorage.setItem('Envio',JSON.stringify(methodShip));
        
      },
      error => alert('codigo postal incorrecto!')
    )
    
  }
 
}
