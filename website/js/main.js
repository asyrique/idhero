
$( document ).ready(function() {
  
  
    $( "#submitButton" ).click(function() {
      var deneme = $("#passwordHolder").val();
      console.log(deneme);
      if ($("#passwordHolder").val() == 1234) {
        console.log('int it');
        var url = "http://localhost:8080/search"; // the script where you handle the form input.
        var dat = $("#valueHolder").val();

        $.ajax({
               type: "POST",
               url: url,
               data: $("#valueHolder").serialize(), // serializes the form's elements.
               success: function(data){
                    console.log(data);

                   $("#phoneNumber").html(data.phone);
                   $("#name").html(data.name);
                   $("#dob").html(data.dob);
                   $("#height").html(data.height);
                   $(".tableClass").fadeTo( "slow", 1 );
               }
             });
        return false; // avoid to execute the actual submit of the form.
      } else {
        alert("PIN error please try again.");
      }
    });

});

