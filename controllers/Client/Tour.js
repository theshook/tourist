exports.tour = (req, res) => {
  let userDetail = req.user || '';
    res.render("Client/Tour", {
      pageTitle: "Tour",
      route: "tour",
      userDetail: userDetail
    });
};