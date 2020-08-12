var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var port = 3333;
var path = require("path");
var session = require("express-session");
var moment = require("moment");
require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");
var Web3 = require("web3");
var product_contract = require("./contract/contract.js");
var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: "192.168.0.12",
  //host: "localhost",
  port: 3306, // db 포트
  user: "block", // user 이름
  password: "block1234!@", // 비밀번호
  database: "team_project", // database 이름
});

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
var smartcontract = new web3.eth.Contract(
  product_contract.abi,
  product_contract.address
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "agnjangjknasjklgnajklngNJKLNWDFJKL",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", function (req, res) {
  if (!req.session.loggedIn) {
    res.render("login", { user: req.session.loggedIn });
  } else {
    connection.query(
      "SELECT * FROM user_list where post_id = ?",
      [req.session.loggedIn.post_id],
      function (err, result, fields) {
        if (err) {
          console.log(err);
        } else {
          res.render("login", {
            userlist: result,
            user: req.session.loggedIn,
          });
        }
      }
    );
  }
});
app.get("/home", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    var sql = "SELECT * FROM car_list";
    connection.query(sql, function (err, rows, fields) {
      if (err) {
        console.log("query is not excuted. select fail...\n" + err);
      } else {
        connection.query(
          "SELECT name, division FROM user_list where post_id = ?",
          [req.session.loggedIn.post_id],
          function (err, result, fields) {
            if (err) {
              console.log(err);
            } else {
              res.render("home", {
                carlist: rows,
                userlist: result,
                user: req.session.loggedIn,
              });
            }
          }
        );
      }
    });
  }
});

app.get("/login", function (req, res) {
  res.render("login", { error: false, user: req.session.loggedIn });
});
app.get("/signup", function (req, res) {
  res.render("signup", { errormessage: null });
});
app.get("/m_select_menu", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    connection.query(
      "SELECT name, division FROM user_list where post_id = ?",
      [req.session.loggedIn.post_id],
      function (err, result, fields) {
        if (err) {
          console.log(err);
        } else {
          res.render("m_select_menu", {
            userlist: result,
            user: req.session.loggedIn,
          });
        }
      }
    );
  }
});
app.get("/m_add_car/create", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    res.render("m_car_list", {
      user: req.session.loggedIn,
    });
  }
});
app.get("/m_car_info", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    res.render("m_car_info", {
      errormessage: null,
      user: req.session.loggedIn,
    });
  }
});

app.get("/logout", function (req, res) {
  if (!req.session.loggedIn) {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
        res.render("error");
      } else {
        res.redirect("/");
      }
    });
  } else {
    res.redirect("/");
  }
});

app.post("/signup", function (req, res) {
  const id = req.body.id;
  const name = req.body.name;
  const password = req.body.password;
  const division = req.body.division;
  connection.query(
    `select post_id from user_list where post_id=?`,
    [id],
    function (err, users) {
      if (err) {
        res.render("signup", {
          errormessage: "오류 발생",
          user: req.session.loggedIn,
        });
      } else if (users.length > 0) {
        res.render("signup", {
          errormessage: "이미 존재하는 이메일",
          user: req.session.loggedIn,
        });
      } else {
        console.log(id);
        console.log(password);
        console.log(name);
        console.log(division);

        connection.query(
          `insert into user_list (post_id, password, name, division, linkcode)
                    values (?, ?, ?, ?, 1)`,
          [id, password, name, division],
          function (err2, result) {
            if (err2) {
              res.render("signup", {
                errormessage: "생성 오류",
                user: req.session.loggedIn,
              });
            } else {
              console.log("생성완료");
              res.redirect("/login");
            }
          }
        );
      }
    }
  );
});

app.post("/login", function (req, res) {
  const id = req.body.id;
  const password = req.body.password;
  connection.query(
    "select * from user_list WHERE post_id=? and password=?",
    [id, password],
    function (err, users) {
      if (err) {
        console.log(err); // 오류
        res.render("error");
      } else if (users.length > 0) {
        req.session.loggedIn = users[0];
        if (users[0].linkcode == 0) {
          connection.query(
            "SELECT * FROM user_list where post_id = ?",
            [req.session.loggedIn.post_id],
            function (err, result, fields) {
              if (err) {
                console.log(err);
              } else {
                res.render("m_select_menu", {
                  userlist: result,
                  user: req.session.loggedIn,
                });
              }
            }
          );
        } else {
          res.redirect("car_list");
        }
      } else {
        //users "빈 list"
        res.render("login", { error: true, user: req.session.loggedIn });
      }
    }
  );
});

app.post("/confirm", function (req, res) {
  const check1 = req.body.check1;
  const check2 = req.body.check2;
  const check3 = req.body.check3;
  const check4 = req.body.check4;
  const check5 = req.body.check5;
  const car_id = req.body.car_id;
  const check_etc = "N/A";
  console.log("checketc = ", req.body.checketc);
  // if (!req.body.checketc) {
  //   check_etc = "N/A";
  // } else {
  //   check_etc = req.body.checketc;
  // }
  var check_time = moment().format("YYYYMMDDHHmmss");

  const checks = check1 + check2 + check3 + check4 + check5;
  console.log(car_id, checks, check_etc, check_time);

  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    smartcontract.methods
      .AddCheckList(car_id, checks, check_etc, parseInt(check_time))
      .send({
        from: "0x7031679C6bcA91Fe32263938f7D3b293272423b6",
        gas: 200000,
      })
      .then(function (receipt) {
        console.log(receipt);
        res.redirect("/car_list");
      });
  }
});

app.post("/m_add_car", function (req, res) {
  const car_id = req.body.car_id;
  const car_div = req.body.car_div;
  const car_type = req.body.car_type;
  const car_birth = req.body.car_birth;
  const car_day = req.body.car_day;
  const var_result = req.body.var_result;
  console.log(car_id, car_div, car_type, car_birth, car_day, var_result);

  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    connection.query(
      `insert into car_list (car_id, car_div, car_type, car_birth, car_day, var_result)
                values (?, ?, ?, ?, ?, ?)`,
      [car_id, car_div, car_type, car_birth, car_day, var_result],
      function (err, result) {
        if (err) {
          console.log("error");
        } else {
          res.redirect("m_car_list");
        }
      }
    );
  }
});

app.get("/check_list/:carnum", function (req, res) {
  const carnum = req.params.carnum;
  var car_res;

  connection.query("SELECT * FROM car_list WHERE car_id=?", [carnum], function (
    err,
    result
  ) {
    if (err) {
      console.log("error");
    } else {
      console.log(result);
      car_res = result;
    }
  });
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    var sql = "SELECT * FROM car_list";
    connection.query(sql, function (err, rows, fields) {
      if (err) {
        console.log("query is not excuted. select fail...\n" + err);
      } else {
        connection.query(
          "SELECT name, division FROM user_list where post_id = ?",
          [req.session.loggedIn.post_id],
          function (err, result, fields) {
            if (err) {
              console.log(err);
            } else {
              res.render("check_list", {
                carlist: rows,
                userlist: result,
                carinfo: car_res,
                user: req.session.loggedIn,
              });
            }
          }
        );
      }
    });
  }
});
app.get("/car_list", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    var sql = "SELECT * FROM car_list";
    connection.query(sql, function (err, rows, fields) {
      if (err) {
        console.log("query is not excuted. select fail...\n" + err);
      } else {
        connection.query(
          "SELECT name, division FROM user_list where post_id = ?",
          [req.session.loggedIn.post_id],
          function (err, result, fields) {
            if (err) {
              console.log(err);
            } else {
              res.render("car_list", {
                carlist: rows,
                userlist: result,
                user: req.session.loggedIn,
              });
            }
          }
        );
      }
    });
  }
});
app.get("/m_car_list", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    var sql = "SELECT * FROM car_list";
    connection.query(sql, function (err, rows, fields) {
      if (err) {
        console.log("query is not excuted. select fail...\n" + err);
      } else {
        connection.query(
          "SELECT * FROM user_list where post_id = ?",
          [req.session.loggedIn.post_id],
          function (err, result, fields) {
            if (err) {
              console.log(err);
            } else {
              res.render("m_Car_list", {
                carlist: rows,
                userlist: result,
                user: req.session.loggedIn,
              });
            }
          }
        );
      }
    });
  }
});
app.get("/m_check_list", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    var sql = "SELECT * FROM car_list";
    connection.query(sql, function (err, rows, fields) {
      if (err) {
        console.log("query is not excuted. select fail...\n" + err);
      } else {
        connection.query(
          "SELECT * FROM user_list where post_id = ?",
          [req.session.loggedIn.post_id],
          function (err, result, fields) {
            if (err) {
              console.log(err);
            } else {
              res.render("m_check_list", {
                carlist: rows,
                userlist: result,
                user: req.session.loggedIn,
              });
            }
          }
        );
      }
    });
  }
});
app.get("/m_add_car", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    var sql = "SELECT * FROM car_list";
    connection.query(sql, function (err, rows, fields) {
      if (err) {
        console.log("query is not excuted. select fail...\n" + err);
      } else {
        connection.query(
          "SELECT * FROM user_list where post_id = ?",
          [req.session.loggedIn.post_id],
          function (err, result, fields) {
            if (err) {
              console.log(err);
            } else {
              res.render("m_add_car", {
                carlist: rows,
                userlist: result,
                user: req.session.loggedIn,
              });
            }
          }
        );
      }
    });
  }
});
app.get("/m_checklist_detail1/:num", function (req, res) {
  const carnum = req.params.num;
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    connection.query(
      "SELECT * FROM user_list where post_id = ?",
      [req.session.loggedIn.post_id],
      function (err, rows, fields) {
        if (err) {
          console.log("query is not excuted. select fail...\n" + err);
        } else {
          var check_array = new Array();
          smartcontract.methods
            .TotalCount()
            .call()
            .then(function (total_count) {
              for (var i = 0; i < total_count; i++) {
                smartcontract.methods
                  .GetCheck(i)
                  .call()
                  .then(function (result) {
                    if (result[1] == carnum) {
                      check_array.push(result);
                    }
                  });
              }

              setTimeout(() => {
                console.log(check_array);
                res.render("m_checklist_detail1", {
                  carlist: check_array,
                  carnum: carnum,
                  userlist: rows,
                  user: req.session.loggedIn,
                });
              }, 2000);
            });
        }
      }
    );
  }
});
// app.get("/m_checklist_detail2/:no", function (req, res) {
//   const no = req.params.no;
//   if (!req.session.loggedIn) {
//     res.redirect("/logout");
//   } else {
//     connection.query("SELECT * FROM check_list where no = ?", [no], function (
//       err,
//       rows,
//       fields
//     ) {
//       if (err) console.log("query is not excuted. select fail...\n" + err);
//       else
//         res.render("m_checklist_detail2", {
//           carlist: rows,
//           user: req.session.loggedIn,
//         });
//     });
//   }
// });
app.get("/m_car_info/:carnum", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    const carnum = req.params.carnum;
    connection.query(
      "SELECT * FROM car_list where car_id = ?",
      [carnum],
      function (err, rows, fields) {
        if (err) {
          console.log("query is not excuted. select fail...\n" + err);
        } else {
          connection.query(
            "SELECT name, division FROM user_list where post_id = ?",
            [req.session.loggedIn.post_id],
            function (err, result, fields) {
              if (err) {
                console.log(err);
              } else {
                res.render("m_car_info", {
                  carlist: rows,
                  userlist: result,
                  user: req.session.loggedIn,
                });
              }
            }
          );
        }
      }
    );
  }
});
app.get("/m_add_car_update/:carnum", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    const carnum = req.params.carnum;
    connection.query(
      "SELECT * FROM car_list where car_id = ?",
      [carnum],
      function (err, rows, fields) {
        if (err) {
          console.log("query is not excuted. select fail...\n" + err);
        } else {
          connection.query(
            "SELECT name, division FROM user_list where post_id = ?",
            [req.session.loggedIn.post_id],
            function (err, result, fields) {
              if (err) {
                console.log(err);
              } else {
                res.render("m_add_car_update", {
                  carlist: rows,
                  userlist: result,
                  user: req.session.loggedIn,
                });
              }
            }
          );
        }
      }
    );
  }
});

app.post("/m_add_car_update", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    connection.query(
      `select * from user_list where post_id = ?`,
      [req.session.loggedIn.post_id],
      function (err, result) {
        if (err) {
          res.render("error");
        } else {
          const car_id = req.body.car_id;
          const car_div = req.body.car_div;
          const car_type = req.body.car_type;
          const car_birth = req.body.car_birth;
          const car_day = req.body.car_day;
          const var_result = req.body.var_result;

          connection.query(
            "UPDATE car_list SET car_id = ?, car_div = ?, car_type = ?, car_birth = ?, car_day = ?, var_result = ? where car_id = ?",
            [car_id, car_div, car_type, car_birth, car_day, var_result, car_id],
            function (err, rows, next) {
              if (err) {
                console.log(err);
              } else {
                res.redirect("/m_car_list");
              }
            }
          );
        }
      }
    );
  }
});

app.get("/m_car_info/delete/:num", function (req, res) {
  if (!req.session.loggedIn) {
    res.redirect("/logout");
  } else {
    const carnum = req.params.num;
    connection.query(
      `delete from car_list where car_id = ?`,
      [carnum],
      function (err, result) {
        if (err) {
          console.log(err);
          res.render("error");
        } else {
          var sql = "SELECT * FROM car_list";
          connection.query(sql, function (err, rows, fields) {
            if (err) {
              console.log("query is not excuted. select fail...\n" + err);
            } else {
              connection.query(
                "SELECT name, post_id FROM user_list where post_id = ?",
                [req.session.loggedIn.post_id],
                function (err, result, fields) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.render("m_Car_list", {
                      carlist: rows,
                      userlist: result,
                      user: req.session.loggedIn,
                    });
                  }
                }
              );
            }
          });
        }
      }
    );
  }
});
server.listen(port, function () {
  var check_time = moment().format("YYYYMMDDHHmmss");
  console.log(check_time);
  console.log("웹 서버 시작", port);
});
