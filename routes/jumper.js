// Mostrar resultado de búsqueda
exports.list = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
    var dats = [];
    if(req.session.isUserLogged){
        if(input.tipo == "nom"){
            var query = 'SELECT * FROM jumper WHERE name = ?';
            dats.push(input.nom);
        } else if(input.tipo == "ape"){
            var query = 'SELECT * FROM jumper WHERE last_name = ?';
            dats.push(input.ape);
        } else if(input.tipo == "nom-ape"){
            var query = 'SELECT * FROM jumper WHERE name = ? AND last_name = ?';
            dats.push(input.nom);
            dats.push(input.ape);
        } else if (input.tipo == "verif"){
            var query = 'SELECT * FROM jumper WHERE correo = ?';
            dats.push(input.verif);
        }
        req.getConnection(function(err,connection){
            connection.query(query,dats,function(err,rows)
            {
                if(err)
                    console.log("Error Selecting : %s ",err );
                res.render('jumpers',{page_title:"Jumpers",data:rows,data2:req.session.jumps});

            });
            //console.log(query.sql);
        });
    }
    else res.redirect('/bad_login');

};
//Index de Búsqueda
exports.prelist = function (req, res) {
    if(req.session.isUserLogged){
        res.render('jumpers',{page_title:"Jumpers", data:[],data2:req.session.jumps});
    } else res.redirect('/bad_login');
};

//Agregar a Venta (variable de sesión).
exports.add2session = function(req, res){
    var input = JSON.parse(JSON.stringify(req.body));
    var ids = input.ids;
    if(req.session.isUserLogged){
        if(ids.length){
            var query = "SELECT * FROM jumper WHERE id = ?";
            for (var i = 1; i<ids.length; i++){
                query += "OR id = ?";
            }
            req.getConnection(function (err, connection) {
                connection.query(query,ids, function (err, rows) {
                    if (err) console.log("Error selecting : %s ", err);
                    var dateFormat = require('dateFormat');
                    for(var i = 0; i < rows.length;i++){
                        var aux = [rows[i].id,rows[i].name,
                            rows[i].last_name, dateFormat(rows[i].fnac,"yyyy-mm-dd")];
                        req.session.jumps.push(aux);
                    }
                    if(parseInt(input.continue)) {
                        res.redirect('/venta');
                    } else
                    res.redirect('/begin_list');
                });
            });

        } else res.redirect('/bad_login');
    }
    else res.redirect('/bad_login');
};
// Aún no implementada
exports.edit = function(req, res){
    var isAdminLogged = req.session.isAdminLogged;

    if(isAdminLogged){
    var phone = req.session.options;

    req.getConnection(function(err,connection){

        var query = connection.query('SELECT * FROM jumper WHERE verificador = ?',[phone],function(err,rows)
        {

            if(err)
                console.log("Error Selecting : %s ",err );

            res.render('edit_contact',{page_title:"Edit Contacts",data:rows});


         });

         //console.log(query.sql);
    });
    }
    else res.redirect('/bad_login');
};

// Guardar desde pre jumpers
exports.save = function(req,res){

    if(req.session.isUserLogged){
        var data =[];
        var dateFormat = require('dateFormat');
        for(var i = 0; i < req.session.pjumps.length;i++){
            req.session.pjumps[i].fnac = dateFormat(req.session.pjumps[i].fnac,
                "yyyy-mm-dd");
            var aux = [req.session.pjumps[i].id,req.session.pjumps[i].name,
                req.session.pjumps[i].last_name, req.session.pjumps[i].fnac];
            if(req.params.isverif == "si"){
                aux.push(req.params.verif);
            }
            req.session.jumps.push(aux);
            data.push(aux);
        }
        if(req.params.isverif == "si"){
            var query = "INSERT INTO jumper (`id`, `name`, `last_name`, `fnac`, `correo`) VALUES ?";
        } else {
            var query = "INSERT INTO jumper (`id`, `name`, `last_name`, `fnac`) VALUES ?";
        }
        req.getConnection(function (err, connection) {

            connection.query(query,[data], function (err, rows) {
                if (err)
                    console.log("Error inserting : %s ", err);
                res.redirect('/venta');
            });
            // console.log(query.sql); get raw query
        });
    }

    else res.redirect('/bad_login');
};
// No implementada
exports.save_edit = function(req,res){


    if(req.session.isAdminLogged){
    
    var input = JSON.parse(JSON.stringify(req.body));
    var phone = req.params.phone;
    
    req.getConnection(function (err, connection) {
        
        var data = {
            
            name    : input.name,
            last_name : input.last_name,
            phone   : input.phone,
            to_call   : input.to_call 
        
        };
        
        connection.query("UPDATE contact set ? WHERE phone = ? ",[data,phone], function(err, rows)
        {
  
          if (err)
              console.log("Error Updating : %s ",err );
         
          res.redirect('/contact');
          
        });
    
    });
    }
    else res.redirect('/bad_login');
};


exports.delete_customer = function(req,res){
    var isAdminLogged = req.session.isAdminLogged;;

    if(req.session.isAdminLogged){
          
     var phone = req.params.phone;
    
     req.getConnection(function (err, connection) {
        
        connection.query("DELETE FROM contact WHERE phone = ? ",[phone], function(err, rows)
        {
            
             if(err)
                 console.log("Error deleting : %s ",err );
            
             res.redirect('/contact');
             
        });
        
     });
    }
    else res.redirect('/bad_login');
};