function onPrint(){

    $(".insertPrint").empty();
    $(".insertPrint").css('display','block');
    $(".insertPrint").append("<br><h4>How might Jeremy feel when he sees these posts?</h4>");
    $(".checkOne").clone().appendTo(".insertPrint");

    $(".insertPrint").append("<br><h4>What are some ways you can achieve media balance on social media?</h4>");
    var responseOne = document.getElementById("literacy_responseOne").value;
    $(".insertPrint").append(responseOne);

    window.print();

    $(".insertPrint").css('display','none');
}

setTimeout(function(){
  $('.ui.label').transition('bounce');
}, 1000);
