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

function hide_all() {
    $('#emails-view').hide();
    $('#email-view').hide();
    $('#compose-view').hide();
}

function compose_email(e, recipients_str="", subject_str="", body_str="") {
    hide_all();
    $("#compose-recipients").removeClass("is-invalid");

    $('#compose-recipients').val(recipients_str);
    $('#compose-subject').val(subject_str);
    $('#compose-body').val(body_str);

    $('#compose-view').show();
}

function reply_forward_email(method="reply", time_str="", sender_str="", recipients_str="", subject_str="", body_str="") {
    if (method === "reply" && subject_str.substring(0,3) !== "Re:") {
        subject_str = "Re: " + subject_str;
    } else if (method === "forward" && subject_str.substring(0,3) !== "Fw:") {
        subject_str = "Fw: " + subject_str;
    }
    body_str = "\n\nOn " + time_str + ", " + sender_str + " wrote:\n" + body_str;
    compose_email(null, recipients_str, subject_str, body_str);
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
    fetch('/emails', email_req).then(response => {
        console.log("send_email", response.status);
        let response_json = response.json();
        if (!response.ok) {
            console.log(response);
            $("#compose-recipients").addClass("is-invalid");
        }
        return response_json
    }).then(result => {
        console.log(result);
        $("#id_recipients_feed_back").html(result.error);
        if (!result.error) {
            load_mailbox("sent");
        }
    });
    return false;
}

function load_mailbox(mailbox) {
    hide_all();
    fetch("/emails/"+mailbox).then(response => {
        console.log("load_mailbox", response.status);
        return response.json();
    }).then(result => {
        result.forEach((email) => {
            console.log(email);
            if (email.subject.length === 0) {
                email.subject = "(No Subject)";
            }
            let card = `<li class="list-group-item">
                            <a class="stretched-link text-secondary text-decoration-none" href onclick="load_email(${email.id});return false;">
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
        });
    });
    // Show the mailbox name
    $('#emails-view').html(`<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
                            <ul class="list-group list-group-flush" id="emails-list"></ul>`);
    // Show the mailbox and hide other views
    $('#emails-view').show();
}

function load_email(email_id) {
    hide_all();
    fetch("/emails/"+email_id).then(response => {
        console.log("load_email", response.status);
        if (!response.ok) {
            console.log(response);
        }
        return response.json();
    }).then(email => {
        console.log(email);
        if (email.error) {
        $('#email-view').html(`<div class="alert alert-danger" role="alert">
                ${email.error}
            </div>`);
        } else {
            if (email.subject.length === 0) {
                email.subject = "(No Subject)";
            }
            $('#email-subject').html(`<h5 class="mx-2 mt-2" style="display: inline-block">${email.subject}</h5>`);
            $('#email-info').html(`<div class="small text-muted mx-2">at ${email.timestamp}</div>
                                   <div class="text-muted mx-2">From: ${email.sender}</div>
                                   <div class="text-muted mx-2">To: ${email.recipients}</div>`);
            $('#email-body').html(`<p class="mx-2 my-2" id="email-body">${email.body}</p>`);
            $("#reply").on("click", () => reply_forward_email("reply", email.timestamp, email.sender, email.sender, email.subject, email.body));
            $("#reply-all").on("click", () => reply_forward_email("reply", email.timestamp, email.sender, email.sender+','+email.recipients, email.subject, email.body));
            $("#forward").on("click", () => reply_forward_email("forward", email.timestamp, email.sender, "", email.subject, email.body));
            if (email.archived) {
                $("#archive").text("Unarchive");
            } else {

                $("#archive").text("Archive");
            }
            $("#archive").on("click", () => archive_email(email_id, !email.archived));
        }
    });

    $('#email-view').show();
    return false;
}

function archive_email(email_id, archive) {
    let email_req = {
        method: 'PUT',
        body: JSON.stringify({
            archived: archive
        })
    };
    fetch("/emails/"+email_id, email_req).then(response => {
        console.log("archive_email", response.status);
        if (!response.ok) {
            console.log(response);
        }
    }).then(() => load_email(email_id));
    return false;
}