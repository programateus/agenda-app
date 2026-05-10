using Backend.Application.UseCases.SignIn;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Backend.Lambda.DTOs;
using Backend.Application.UseCases.SignUp;
using Backend.Lambda.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Lambda.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }
    
    [AllowAnonymous]
    [HttpPost]
    [Route("sign-up")]
    [EndpointSummary("Sign Up")]
    [EndpointDescription("Sign Up")]
    public async Task<IActionResult> SignUp(SignUpDTO request, CancellationToken cancellationToken)
    {
        var command = new SignUpCommand(request.Name, request.Email, request.Password);
        var result = await _sender.Send(command, cancellationToken);
        return result.ToActionResult(this);
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("sign-in")]
    [EndpointSummary("Sign In")]
    [EndpointDescription("Sign In")]
    public async Task<IActionResult> SignIn(SignInDTO request, CancellationToken cancellationToken)
    {
        var command = new SignInCommand(request.Email, request.Password);
        var result = await _sender.Send(command, cancellationToken);
        return result.ToActionResult(this);
    }
}