$(document).ready(function() {
    // Use buttons to toggle between views
    $('#inbox').on('click', () => load_mailbox('inbox'));
    $('#sent').on('click', () => load_mailbox('sent'));
    $('#archived').on('click', () => load_mailbox('archive'));
    $('#compose').on('click', compose_email);
    $("#id_submit_button").on('click', send_email);
    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {
    // Show compose view and hide other views
    $('#emails-view').hide();
    $('#compose-view').show();

    // Clear out composition fields
    $('#compose-recipients').val('');
    $('#compose-subject').val('');
    $('#compose-body').val('');
}

function send_email() {
    let email_req = {
        method: 'POST',
        body: JSON.stringify({
            recipients: $("#compose-recipients").val(),
            subject: $("#compose-subject").val(),
            body: $("#compose-body").val()
        })
    };
    $("#compose-recipients").removeClass("is-invalid");
    fetch('/emails', email_req)
    .then(response => {
        let response_json = response.json();
        if (!response.ok) {
            console.log(response.status);
            $("#compose-recipients").addClass("is-invalid");
        }
        return response_json
    })
    .then(result => {
        console.log(result);
        $("#id_recipients_feed_back").html(result.error);
    });
    load_mailbox("Sent");
    return false;
}

function load_mailbox(mailbox) {
    let mailbox_req = {
        method: 'GET'
    }

    fetch("/emails/"+mailbox)
    .then(response => response.json())
    .then(result => {
        result.forEach((email) => {
            console.log(email);
            let card = `<li class="list-group-item">
                            <a class="stretched-link text-decoration-none" href="#${email.id}">
                                <div class="row">
                                <div class="col-4">
                                <h5 class="mx-2 mt-2">${email.subject}</h5>
                                <small class="text-muted mx-2 mb-2">by ${email.sender} at ${email.timestamp}</small>
                                </div>
                                <div class="col-8">
                                <p class="small text-muted mx-2 my-2">${email.body}</p>
                                </div>
                                </div>
                            </a>
                        </li>`;
            $("#emails-list").append(card);
        })

    })

    // Show the mailbox and hide other views
    $('#emails-view').show();
    $('#compose-view').hide();

    // Show the mailbox name
    $('#emails-view').html(`<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
                            <ul class="list-group list-group-flush" id="emails-list"></ul>`);
}

function load_email(email_id) {

}