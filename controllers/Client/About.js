exports.about_us = (req, res) => {
  let userDetail = req.user || '';
    res.render("Client/About", {
      pageTitle: "About Us",
      route: "about",
      userDetail: userDetail
    });
};